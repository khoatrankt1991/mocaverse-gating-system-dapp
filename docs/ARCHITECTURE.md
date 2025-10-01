# System Architecture

Technical architecture and design decisions for the Moca Gating System.

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│                    (Next.js 14 + TailwindCSS)                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTPS/JSON
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend API Layer                          │
│                  (Cloudflare Workers + Hono)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │   Routes     │  │   Services   │  │   Utilities        │   │
│  │ - verifyCode │  │ - inviteCode │  │ - validation       │   │
│  │ - checkEmail │  │ - nftService │  │ - codeGenerator    │   │
│  │ - reserve    │  │ - emailSvc   │  │ - blockchain       │   │
│  │ - admin      │  │ - rateLimit  │  │                    │   │
│  └──────────────┘  └──────────────┘  └────────────────────┘   │
└────────┬──────────────────┬──────────────────┬─────────────────┘
         │                  │                  │
         │ D1 (SQL)         │ KV (Cache)       │ ethers.js
         ▼                  ▼                  ▼
┌────────────────┐  ┌────────────────┐  ┌─────────────────────┐
│  D1 Database   │  │  KV Storage    │  │  Ethereum Sepolia   │
│ - invite_codes │  │ - NFT cache    │  │  MockMocaNFT.sol    │
│ - registrations│  │ - rate limits  │  │  - Staking logic    │
└────────────────┘  └────────────────┘  └─────────────────────┘
```

---

## 📦 Phase 1: Smart Contracts

### MockMocaNFT Contract

**Purpose:** NFT with staking mechanism for VIP gating

**Key Components:**

```solidity
contract MockMocaNFT is ERC721, Ownable {
  struct StakeInfo {
    uint256 stakedAt;
    bool isStaked;
  }
  
  mapping(uint256 => StakeInfo) public stakes;
  uint256 constant MIN_STAKE_DURATION = 7 days;
  
  function hasEligibleNFT(address user) public view returns (bool)
}
```

**Design Decisions:**

1. **ERC-721 Standard**
   - Full compatibility with wallets and marketplaces
   - OpenZeppelin for security-audited base

2. **Staking Mechanism**
   - On-chain timestamp tracking
   - Transfer protection for staked NFTs
   - Minimum 7-day requirement

3. **Eligibility Check**
   - `hasEligibleNFT()` scans all user's NFTs
   - Trade-off: Gas cost vs simplicity
   - Production: Consider user→tokens mapping

**Tech Stack:**
- Solidity 0.8.20
- Hardhat (development framework)
- OpenZeppelin Contracts
- ethers.js v6
- TypeScript

**Deployment:**
- Network: Sepolia Testnet
- Contract: `0xAAF273a3C22A61e8104D4DFC83c16e1E4E273a10`
- Verified on Etherscan

---

## 🚀 Phase 2: Backend API

### Architecture Layers

#### 1. **Routes Layer** (`src/routes/`)
- HTTP endpoint handlers
- Request validation
- Response formatting
- Error handling

#### 2. **Services Layer** (`src/services/`)
- Business logic
- Database operations
- External API calls
- Caching logic

#### 3. **Utils Layer** (`src/utils/`)
- Validation schemas (Zod)
- Code generation
- Blockchain interaction
- Helper functions

### Data Flow

```
Request → Route → Validation → Service → Database/Blockchain → Response
                      ↓
                 Rate Limit Check
                      ↓
                  Cache Check
```

### Database Schema (D1)

**invite_codes**
```sql
CREATE TABLE invite_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,          -- MOCA-XXXXXXXX
  referrer_email TEXT,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  is_active INTEGER DEFAULT 1
);
```

**registrations**
```sql
CREATE TABLE registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  wallet_address TEXT UNIQUE,
  invite_code_id INTEGER,
  registration_type TEXT CHECK(registration_type IN ('nft', 'invite')),
  registered_at INTEGER NOT NULL,
  FOREIGN KEY (invite_code_id) REFERENCES invite_codes(id)
);
```

### Caching Strategy (KV)

**NFT Eligibility Cache:**
- Key: `nft_eligibility:{wallet_address}`
- TTL: 10 minutes
- Reduces on-chain calls

**Rate Limiting:**
- Key: `rate_limit:{email}`
- TTL: 1 hour
- Max: 5 requests per hour

### Design Decisions

1. **Cloudflare Workers**
   - ✅ Edge deployment (low latency)
   - ✅ Serverless (auto-scaling)
   - ✅ Free tier generous
   - ✅ D1 & KV integration

2. **Hono Framework**
   - ✅ Lightweight (~12KB)
   - ✅ Fast routing
   - ✅ TypeScript-first
   - ✅ Middleware support

3. **D1 Database**
   - ✅ SQLite-based (familiar SQL)
   - ✅ Built into Workers
   - ✅ Free tier: 5GB storage
   - ❌ Read-after-write consistency (eventual)

4. **KV Storage**
   - ✅ Low-latency key-value store
   - ✅ Perfect for caching
   - ✅ TTL support
   - ❌ Eventual consistency

**Tech Stack:**
- Hono v4 (Web framework)
- Cloudflare D1 (SQL database)
- Cloudflare KV (Cache/rate limiting)
- ethers.js v6 (Blockchain)
- Zod (Validation)
- TypeScript

---

## 🎨 Phase 3: Frontend (In Progress)

### Planned Architecture

```
┌─────────────────────────────────────────┐
│         Next.js App Router              │
│  ┌──────────────────────────────────┐   │
│  │  Page: /                         │   │
│  │  - GatingOptions                 │   │
│  │  - InviteCodeForm                │   │
│  │  - NFTVerification               │   │
│  │  - EmailForm                     │   │
│  │  - SuccessScreen                 │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  Hooks:                          │   │
│  │  - useWallet                     │   │
│  │  - useInviteCode                 │   │
│  │  - useRegistration               │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  Lib:                            │   │
│  │  - api.ts (Backend calls)        │   │
│  │  - wallet.ts (Web3 interaction)  │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**State Management:**
- React State (useState, useContext)
- Step-based flow (select → verify → register → success)

**Web3 Integration:**
- ethers.js for wallet connection
- MetaMask/WalletConnect support
- Message signing for ownership proof

**Planned Tech Stack:**
- Next.js 14 (App Router)
- TailwindCSS
- ethers.js v6
- TypeScript

---

## 🔐 Security Architecture

### Input Validation
```
User Input → Zod Schema → Sanitization → Business Logic
```

**Validation Layers:**
1. Frontend validation (UX)
2. API validation (Zod schemas)
3. Database constraints

### Authentication

**Admin Endpoints:**
```
Request → Extract X-API-Key → Compare with env → Allow/Deny
```

**NFT Verification:**
```
1. User signs message with wallet
2. Backend verifies signature
3. Backend checks NFT eligibility on-chain
4. Result cached in KV
```

### Rate Limiting

```
Request → Extract email → Check KV counter → Allow/Deny
                              ↓
                         Increment counter
                         Set TTL (1 hour)
```

---

## 📊 Performance Considerations

### Smart Contracts
- `hasEligibleNFT()` iterates all tokens → O(n)
- For production: Maintain user→tokens mapping → O(1)
- Current implementation optimized for clarity

### Backend API
- **Response Times:**
  - Check email/wallet: ~10ms (D1 query)
  - Verify code: ~15ms (D1 query)
  - Reserve (cached NFT): ~50ms
  - Reserve (on-chain check): ~500ms+

- **Optimization:**
  - KV caching for NFT eligibility (10 min)
  - Indexed database queries
  - Edge deployment (low latency)

### Database
- Indexes on frequently queried columns
- Atomic operations for code usage
- Foreign key constraints for data integrity

---

## 🔄 Data Consistency

### D1 (Eventual Consistency)
- Writes propagate globally (eventual)
- Race condition handling:
  - Unique constraints prevent duplicates
  - Atomic increments for code usage

### KV (Eventual Consistency)
- Reads may be stale (up to 60s)
- Acceptable for:
  - NFT eligibility cache (10 min TTL)
  - Rate limiting (approximate)

---

## 🎯 Design Trade-offs

| Decision | Pro | Con | Chosen For |
|---|---|---|---|
| **Cloudflare Workers** | Edge deployment, free tier | Vendor lock-in | Low latency, cost |
| **D1 vs PostgreSQL** | Integrated, simple | Eventual consistency | Simplicity, cost |
| **KV vs Redis** | Built-in, serverless | Limited features | Integration, cost |
| **Zod vs Joi** | TypeScript-first | Smaller ecosystem | Type safety |
| **Hono vs Express** | Lightweight, fast | Newer, less mature | Performance |

---

## 🚀 Scalability

### Current Limits
- **Cloudflare Workers:** 100k requests/day (free tier)
- **D1 Database:** 5GB storage, 5M rows read/day
- **KV Storage:** 100k operations/day

### Scaling Strategy
1. **Vertical:** Upgrade Cloudflare plan
2. **Horizontal:** Workers auto-scale at edge
3. **Optimization:**
   - Increase cache TTL
   - Batch database operations
   - Optimize queries with indexes

---

## 📝 Future Improvements

1. **Smart Contracts:**
   - User→tokens mapping for O(1) lookup
   - Upgradeable proxy pattern
   - Events for off-chain indexing

2. **Backend:**
   - GraphQL API option
   - Webhook notifications
   - Analytics/monitoring dashboard

3. **Frontend:**
   - Progressive Web App (PWA)
   - Mobile-first design
   - Multi-language support

---

## 🔗 References

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Hono Documentation](https://hono.dev/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [ethers.js Documentation](https://docs.ethers.org/v6/)

