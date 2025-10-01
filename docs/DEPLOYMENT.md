# Deployment Guide

Complete guide to deploying the Moca Gating System to production.

---

## 📋 Prerequisites

- Cloudflare account (free tier works)
- Alchemy/Infura account for RPC
- MetaMask wallet with Sepolia ETH
- Git and Node.js ≥18
- Domain name (optional, for custom domain)

---

## 🔷 Phase 1: Smart Contracts

### Deploy to Sepolia Testnet

**1. Setup Environment**
```bash
cd smart-contracts
npm install
cp .env.example .env
```

**2. Configure `.env`**
```bash
ALCHEMY_KEY=your_alchemy_api_key_here
ACCOUNT_PRIVATE_KEY=your_wallet_private_key_here
ETHERSCAN_API_KEY=your_etherscan_key_here  # Optional
```

**Get Alchemy Key:**
1. Sign up at [alchemy.com](https://www.alchemy.com/)
2. Create new app → Ethereum → Sepolia
3. Copy API key

**Get Sepolia ETH:**
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Chainlink Faucet](https://faucets.chain.link/sepolia)
- Need ~0.01 ETH for deployment

**3. Compile & Test**
```bash
npm run compile
npm test
```

**4. Deploy to Sepolia**
```bash
npm run deploy:sepolia
```

**5. Save Contract Address**
```
✅ MockMocaNFT deployed to: 0x...
```

Copy this address - you'll need it for backend configuration.

**6. Verify on Etherscan (Optional)**
```bash
npx hardhat verify --network sepolia 0xYOUR_CONTRACT_ADDRESS
```

---

## 🚀 Phase 2: Backend API

### Deploy to Cloudflare Workers

**1. Install Wrangler & Login**
```bash
cd backend
npm install

# Login to Cloudflare (opens browser)
npx wrangler login

# Verify login
npx wrangler whoami
```

**2. Create D1 Database**
```bash
npx wrangler d1 create moca-invite-system-db
```

Output:
```
database_id = "xxxx-yyyy-zzzz"
```

**Update `wrangler.toml`:**
```toml
[[d1_databases]]
binding = "DB"
database_name = "moca-invite-system-db"
database_id = "xxxx-yyyy-zzzz"  # ← Replace with your ID
```

**3. Create KV Namespace**
```bash
npx wrangler kv:namespace create KV
```

Output:
```
id = "abcd1234efgh5678"
```

**Update `wrangler.toml`:**
```toml
[[kv_namespaces]]
binding = "KV"
id = "abcd1234efgh5678"  # ← Replace with your ID
```

**4. Run Remote Migrations**
```bash
npm run db:migrate:remote
```

**5. Set Production Secrets**
```bash
# Admin API key (interactive prompt)
npx wrangler secret put ADMIN_API_KEY
# Enter: your_secure_random_key_here

# Other secrets (optional, can use wrangler.toml vars)
npx wrangler secret put SEPOLIA_RPC_URL
npx wrangler secret put NFT_CONTRACT_ADDRESS
```

**6. Update `wrangler.toml` Variables**
```toml
[vars]
SEPOLIA_RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY"
NFT_CONTRACT_ADDRESS = "0xYOUR_CONTRACT_ADDRESS_FROM_PHASE1"
```

**7. Deploy to Production**
```bash
npm run deploy
```

Output:
```
✨ Deployed to:
   https://moca-gating-backend.YOUR_SUBDOMAIN.workers.dev
```

**8. Test Production API**
```bash
curl https://moca-gating-backend.YOUR_SUBDOMAIN.workers.dev/
```

**9. Generate Initial Invite Codes (Optional)**
```bash
curl -X POST https://YOUR_WORKER_URL/api/admin/generate-code \
  -H "X-API-Key: your_admin_key" \
  -H "Content-Type: application/json" \
  -d '{"maxUses": 10}'
```

---

## 🎨 Phase 3: Frontend (Coming Soon)

### Deploy to Cloudflare Pages

**1. Build Production**
```bash
cd frontend
npm install
npm run build
```

**2. Deploy to Cloudflare Pages**
```bash
npx wrangler pages deploy out
```

**3. Configure Environment Variables**

In Cloudflare Dashboard → Pages → Your Project → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://moca-gating-backend.YOUR_SUBDOMAIN.workers.dev
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NFT_CONTRACT=0xYOUR_CONTRACT_ADDRESS
```

**4. Custom Domain (Optional)**

Cloudflare Dashboard → Pages → Custom Domains → Add

---

## 🔒 Security Checklist

### Smart Contracts
- [ ] Private key stored securely (not in git)
- [ ] Contract verified on Etherscan
- [ ] Ownership transferred if needed
- [ ] Test transactions on testnet first

### Backend
- [ ] Admin API key is strong (≥32 chars)
- [ ] Secrets stored in Wrangler Secrets (not vars)
- [ ] RPC URL has rate limiting
- [ ] CORS configured for production domain
- [ ] Database backed up regularly

### Frontend
- [ ] Environment variables use `NEXT_PUBLIC_` prefix
- [ ] API URL points to production
- [ ] No sensitive data in client code
- [ ] HTTPS enabled (Cloudflare auto)

---

## 🔄 Update & Rollback

### Update Smart Contract
⚠️ **Cannot update deployed contract** - Deploy new version if needed.

### Update Backend
```bash
cd backend

# If database schema changed
npm run db:migrate:remote

# Deploy new code
npm run deploy
```

**Rollback Backend:**
```bash
npx wrangler rollback
```

### Update Frontend
```bash
cd frontend
npm run build
npx wrangler pages deploy out
```

**Rollback Frontend:**
Cloudflare Dashboard → Pages → Deployments → Previous Deployment → Rollback

---

## 📊 Monitoring

### Cloudflare Dashboard

**Workers Analytics:**
- Requests per second
- Error rates
- CPU time
- Memory usage

**D1 Metrics:**
- Queries per second
- Storage usage
- Read/write operations

**KV Metrics:**
- Operations per second
- Storage used

### Logs

**Real-time Logs:**
```bash
npx wrangler tail
```

**Filter Logs:**
```bash
npx wrangler tail --format pretty
```

---

## 🧪 Testing Production

### Health Check
```bash
curl https://YOUR_WORKER_URL/
```

### Test Endpoints
```bash
# Check email
curl "https://YOUR_WORKER_URL/api/check-email?email=test@example.com"

# Generate code (admin)
curl -X POST https://YOUR_WORKER_URL/api/admin/generate-code \
  -H "X-API-Key: YOUR_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"maxUses": 1}'

# Get stats (admin)
curl https://YOUR_WORKER_URL/api/admin/stats \
  -H "X-API-Key: YOUR_ADMIN_KEY"
```

---

## 💰 Cost Estimation

### Cloudflare Workers (Free Tier)
- **Requests:** 100,000/day
- **CPU Time:** 10ms/request
- **D1:** 5GB storage, 5M rows read/day
- **KV:** 100k operations/day

**Paid Plan ($5/month):**
- 10M requests/month
- 50ms CPU time
- Unlimited D1 & KV operations

### Alchemy RPC (Free Tier)
- **Compute Units:** 300M/month
- **Requests:** ~3M/month
- Enough for moderate usage

### Total Cost
- **Development:** $0/month
- **Low Traffic:** $0/month (free tiers)
- **Medium Traffic:** ~$5-10/month

---

## 🐛 Troubleshooting

### "Database not found"
```bash
# Re-run migrations
cd backend
npm run db:migrate:remote
```

### "KV namespace not found"
Check `wrangler.toml` has correct KV ID from creation step.

### "Unauthorized" on admin endpoints
Verify `ADMIN_API_KEY` secret is set:
```bash
npx wrangler secret list
```

### "Contract call failed"
- Check RPC URL is correct
- Verify contract address
- Ensure RPC has enough credits

### "Rate limit exceeded" (Alchemy)
Upgrade Alchemy plan or optimize caching (increase TTL).

---

## 📝 Post-Deployment Checklist

- [ ] Smart contract deployed and verified
- [ ] Backend API responding at production URL
- [ ] Database migrations applied
- [ ] Secrets configured
- [ ] Admin can generate invite codes
- [ ] Test registration flow (both paths)
- [ ] Frontend connected to backend
- [ ] Custom domain configured (if applicable)
- [ ] Monitoring/alerts set up
- [ ] Documentation updated with URLs

---

## 🔗 Quick Reference

### URLs After Deployment
- **Smart Contract:** `https://sepolia.etherscan.io/address/0x...`
- **Backend API:** `https://moca-gating-backend.*.workers.dev`
- **Frontend:** `https://moca-gating.pages.dev`

### Important Commands
```bash
# Deploy backend
cd backend && npm run deploy

# View logs
npx wrangler tail

# Rollback
npx wrangler rollback

# Check secrets
npx wrangler secret list
```

---

## 🆘 Support

- **Cloudflare Docs:** [developers.cloudflare.com](https://developers.cloudflare.com/)
- **Hardhat Docs:** [hardhat.org](https://hardhat.org/)
- **Issue Tracker:** GitHub Issues

