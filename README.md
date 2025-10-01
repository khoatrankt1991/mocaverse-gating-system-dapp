# Moca Gating System

VIP access gating system using NFT staking or invite codes.

## 🎯 Overview

A multi-tier gating system that grants VIP access through:
- **NFT Path**: Hold & stake a Moca NFT for ≥7 days
- **Invite Code Path**: Use a valid invite code

Built with Ethereum smart contracts and Cloudflare Workers.

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥18
- Git
- MetaMask wallet (for testing)
- Alchemy/Infura account

### 1. Smart Contracts (Local Testing)
```bash
cd smart-contracts
npm install
npm test                    # Run 24 tests
```

### 2. Backend API (Local Development)
```bash
cd backend
npm install
cp .dev.vars.example .dev.vars
# Edit .dev.vars with contract address

npm run db:migrate:local    # Setup database
npm run dev                 # Start server at http://localhost:8787
npm run test:integration    # Run integration tests
```

### 3. Frontend (Coming Soon)
```bash
cd frontend
npm install
npm run dev
```

---

## 📊 Project Status

| Phase | Status | Description |
|---|---|---|
| **Phase 1** | ✅ Complete | Smart Contracts deployed on Sepolia |
| **Phase 2** | ✅ Complete | Backend API with D1 & KV |
| **Phase 3** | ⏳ In Progress | Frontend with Next.js 14 |

---

## 🔗 Deployed Contracts

**MockMocaNFT (Sepolia)**
- Address: `0xAAF273a3C22A61e8104D4DFC83c16e1E4E273a10`
- [View on Etherscan](https://sepolia.etherscan.io/address/0xAAF273a3C22A61e8104D4DFC83c16e1E4E273a10#code)

---

## 📚 Documentation

- **[API Documentation](./docs/API.md)** - Detailed API endpoints & examples
- **[Architecture](./docs/ARCHITECTURE.md)** - System design & tech stack
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - How to deploy to production

### Component READMEs
- [Smart Contracts](./smart-contracts/README.md)
- [Backend API](./backend/README.md)
- [Integration Tests](./backend/scripts/README.md)

---

## 🛠️ Tech Stack

- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin, ethers.js
- **Backend**: Cloudflare Workers, Hono, D1, KV, TypeScript
- **Frontend**: Next.js 14, TailwindCSS, ethers.js (Coming Soon)

---

## 🧪 Testing

```bash
# Smart contracts
cd smart-contracts && npm test

# Backend API
cd backend && npm run test:integration

# Frontend (Coming Soon)
cd frontend && npm test
```

---

## 🤝 Contributing

This is a code challenge project. For questions or feedback, please open an issue.

---

## 📄 License

MIT
