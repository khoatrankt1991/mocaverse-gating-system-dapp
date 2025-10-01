# Moca Gating System - Backend API

Backend API built with Cloudflare Workers, Hono, D1 Database, and KV storage.

## 🚀 Tech Stack

- **Framework**: [Hono](https://hono.dev/) - Ultra-fast web framework for Cloudflare Workers
- **Database**: [D1](https://developers.cloudflare.com/d1/) - Cloudflare's serverless SQL database
- **Cache/Rate Limiting**: [KV](https://developers.cloudflare.com/kv/) - Cloudflare's key-value storage
- **Blockchain**: [ethers.js](https://ethers.org/) - Ethereum interaction
- **Validation**: [Zod](https://zod.dev/) - TypeScript schema validation

## 📋 Features

- ✅ Invite code verification and management
- ✅ NFT eligibility checking (on-chain verification)
- ✅ Email/wallet duplication prevention
- ✅ Rate limiting (5 requests/hour per email)
- ✅ NFT eligibility caching (10 min TTL)
- ✅ Admin endpoints for invite code generation

## 🔧 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create D1 Database

```bash
npm run db:create
```

This will output a database ID. Copy it and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "moca-invite-system-db"
database_id = "YOUR_DATABASE_ID_HERE"
```

### 3. Create KV Namespace

```bash
wrangler kv:namespace create KV
```

Copy the ID and update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "KV"
id = "YOUR_KV_ID_HERE"
```

### 4. Run Migrations

```bash
# Local development
npm run db:migrate:local

# Production
npm run db:migrate:remote
```

### 5. Setup Environment Variables

Copy `.dev.vars.example` to `.dev.vars`:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` with your values:

```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
NFT_CONTRACT_ADDRESS=0xAAF273a3C22A61e8104D4DFC83c16e1E4E273a10
ADMIN_API_KEY=your_secret_admin_key
```

### 6. Run Development Server

```bash
npm run dev
```

Server will be available at `http://localhost:8787`

---

## 🔄 Local vs Production

| | Local Development | Production |
|---|---|---|
| **Login required?** | ❌ No | ✅ Yes (`wrangler login`) |
| **Database** | Auto-created local SQLite | Create with `wrangler d1 create` |
| **KV Storage** | In-memory simulation | Create with `wrangler kv:namespace create` |
| **Environment** | `.dev.vars` file | `wrangler secret put` |
| **Migrations** | `npm run db:migrate:local` | `npm run db:migrate:remote` |
| **Start server** | `npm run dev` | `npm run deploy` |
| **URL** | `http://localhost:8787` | `https://[name].workers.dev` |
| **Offline?** | ✅ Yes | ❌ No |

---

## 📡 API Endpoints

### Public Endpoints

#### 1. Verify Invite Code
```http
GET /api/verify-code?code=MOCA-XXXXXXXX
```

**Response:**
```json
{
  "valid": true,
  "usesLeft": 1
}
```

#### 2. Check Email
```http
GET /api/check-email?email=user@example.com
```

**Response:**
```json
{
  "used": false
}
```

#### 3. Check Wallet
```http
GET /api/check-wallet?wallet=0x...
```

**Response:**
```json
{
  "used": false
}
```

#### 4. Reserve Spot
```http
POST /api/reserve
Content-Type: application/json

{
  "email": "user@example.com",
  "walletAddress": "0x...",
  "signature": "0x...",
  "registrationType": "nft"
}
```

**OR**

```json
{
  "email": "user@example.com",
  "inviteCode": "MOCA-XXXXXXXX",
  "registrationType": "invite"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "registration": {
    "email": "user@example.com",
    "type": "nft",
    "registeredAt": 1704153600000
  }
}
```

### Admin Endpoints

Require `X-API-Key` header with admin API key.

#### 1. Generate Invite Code
```http
POST /api/admin/generate-code
X-API-Key: your_admin_key
Content-Type: application/json

{
  "referrerEmail": "admin@example.com",
  "maxUses": 5
}
```

**Response:**
```json
{
  "success": true,
  "code": "MOCA-ABC12345",
  "maxUses": 5,
  "referrerEmail": "admin@example.com"
}
```

#### 2. Get Statistics
```http
GET /api/admin/stats
X-API-Key: your_admin_key
```

**Response:**
```json
{
  "inviteCodes": {
    "total": 100,
    "active": 45
  },
  "registrations": {
    "total": 250,
    "nft": 150,
    "invite": 100
  }
}
```

## 🗄️ Database Schema

### `invite_codes`
- `id`: INTEGER PRIMARY KEY
- `code`: TEXT UNIQUE (format: MOCA-XXXXXXXX)
- `referrer_email`: TEXT
- `max_uses`: INTEGER
- `current_uses`: INTEGER
- `created_at`: INTEGER (timestamp)
- `is_active`: INTEGER (0 or 1)

### `registrations`
- `id`: INTEGER PRIMARY KEY
- `email`: TEXT UNIQUE
- `wallet_address`: TEXT UNIQUE
- `invite_code_id`: INTEGER (FK)
- `registration_type`: TEXT ('nft' or 'invite')
- `registered_at`: INTEGER (timestamp)

## 🚀 Deployment

### Prerequisites

Before deploying to production, you need:
- Cloudflare account (free tier works)
- Wrangler CLI authenticated

### Step 1: Login to Cloudflare

**First time only:**
```bash
wrangler login
```

This will:
- Open browser for authentication
- Save credentials locally
- Grant access to your Cloudflare account

To check login status:
```bash
wrangler whoami
```

### Step 2: Create Production Resources

**Create D1 Database:**
```bash
wrangler d1 create moca-invite-system-db
```

Copy the `database_id` from output and update `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "moca-invite-system-db"
database_id = "YOUR_DATABASE_ID_HERE"  # Replace with actual ID
```

**Create KV Namespace:**
```bash
wrangler kv:namespace create KV
```

Copy the `id` from output and update `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "KV"
id = "YOUR_KV_ID_HERE"  # Replace with actual ID
```

### Step 3: Run Remote Migrations

```bash
npm run db:migrate:remote
```

This applies database schema to production D1.

### Step 4: Set Production Secrets

```bash
wrangler secret put ADMIN_API_KEY
# Enter your admin key when prompted
```

**Note:** Environment variables in `wrangler.toml` under `[vars]` are public. For sensitive data (like API keys), always use `wrangler secret put`.

### Step 5: Deploy to Cloudflare Workers

```bash
npm run deploy
```

Your API will be live at: `https://moca-gating-backend.YOUR_SUBDOMAIN.workers.dev`

### Update Deployment

After code changes:
```bash
# If database schema changed
npm run db:migrate:remote

# Deploy new code
npm run deploy
```

### Rollback

Cloudflare keeps deployment history. To rollback:
```bash
wrangler rollback
```

## 🧪 Testing

### Test Invite Code Flow

```bash
# Generate a code (admin)
curl -X POST http://localhost:8787/api/admin/generate-code \
  -H "X-API-Key: your_admin_key" \
  -H "Content-Type: application/json" \
  -d '{"maxUses": 1}'

# Verify code
curl "http://localhost:8787/api/verify-code?code=MOCA-ABC12345"

# Reserve with code
curl -X POST http://localhost:8787/api/reserve \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "inviteCode": "MOCA-ABC12345",
    "registrationType": "invite"
  }'
```

### Test NFT Flow

```bash
# Check wallet (requires NFT staked for 7+ days)
curl "http://localhost:8787/api/check-wallet?wallet=0x..."

# Reserve with NFT
curl -X POST http://localhost:8787/api/reserve \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nft@example.com",
    "walletAddress": "0x...",
    "signature": "0x...",
    "registrationType": "nft"
  }'
```

## 📝 Rate Limiting

- **5 requests per hour** per email address
- Uses KV storage with 1-hour TTL
- Returns 429 status when limit exceeded

## 🔐 Security

- Email normalization (lowercase, trim)
- Wallet address validation (checksummed)
- Signature verification for NFT registration
- Admin endpoints protected by API key
- Rate limiting to prevent abuse
- Input validation with Zod schemas

## 🎯 NFT Eligibility Caching

- NFT eligibility checks cached for **10 minutes**
- Reduces on-chain calls
- Cache key: `nft_eligibility:{wallet_address}`

## 📊 Code Generation

- Format: `MOCA-XXXXXXXX`
- Character set: `A-Z2-9` (excludes confusing chars: 0, O, I, 1, l)
- Uniqueness guaranteed via DB check
- Max 10 generation attempts

## 🔄 Next Steps

After backend is running:
1. Test all endpoints locally
2. Deploy to Cloudflare Workers
3. Configure frontend to use the API
4. Monitor logs and metrics

## 🐛 Troubleshooting

### Database not found
```bash
npm run db:migrate:local
```

### KV namespace errors
Create KV namespace and update wrangler.toml with correct ID

### NFT verification fails
Check SEPOLIA_RPC_URL and NFT_CONTRACT_ADDRESS in .dev.vars

