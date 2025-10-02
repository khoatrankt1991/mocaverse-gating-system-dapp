# Moca Gating System

VIP access gating system using NFT staking or invite codes.

## 🎯 Overview

A multi-tier gating system that grants VIP access through:
- **NFT Path**: Hold & stake a Moca NFT for ≥7 days
- **Invite Code Path**: Use a valid invite code

Built with Ethereum smart contracts and Cloudflare Workers.

**🔧 Full CI/CD Pipeline**: Automated testing for smart contracts, backend, and frontend with GitHub Actions.

**🌐 [Try the Live App →](https://mocaverse-gating-system.vercel.app/)**

**📸 [View Screenshots →](./docs/TESTING.md)**

### 📋 Video Demo 1:
**🎥 [Watch Demo →](https://www.loom.com/share/8f2140ff21944da09c0d1d338c09dbaf?sid=08ffd310-25b1-42ce-bc69-74c148ebee47)**
- **Two main flows**: NFT eligible + Invite code success
- **Two case scenarios** demonstrated in detail

### 📋 Video Demo 2:
**🎥 [Watch Demo →](https://www.loom.com/share/c38af9851a914cf0ab161b88bf6c087e?sid=30cafa68-de04-41f2-9105-e354fd74b7ea)**
- **Full workflow**: User receives NFT → Stake → Wait for duration → Join VIP
- **Duration setting**: 1 minute (instead of 7 days in production)
- **Configurable duration**: Can be customized

---

## 🚀 Quick Start

**🌐 [Try the Live App →](https://mocaverse-gating-system.vercel.app/)**

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

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                 # Start at http://localhost:3001
```

---

## 📊 Project Status

| Phase | Status | Description |
|---|---|---|
| **Phase 1** | ✅ Complete | Smart Contracts deployed on Sepolia |
| **Phase 2** | ✅ Complete | Backend API with D1 & KV |
| **Phase 3** | ✅ Complete | Frontend with Next.js 15 & RainbowKit |

---

## 🔗 Production URLs

**🌐 Live Application**
- **Frontend**: [https://mocaverse-gating-system.vercel.app/](https://mocaverse-gating-system.vercel.app/) - Try the live app!

**Backend API (Cloudflare Workers)**
- URL: [https://moca-gating-system.kai-tran9xx.workers.dev/](https://moca-gating-system.kai-tran9xx.workers.dev/)
- Swagger Docs: [https://moca-gating-system.kai-tran9xx.workers.dev/docs](https://moca-gating-system.kai-tran9xx.workers.dev/docs)

**Smart Contracts (Sepolia)**
- MockMocaNFT: `0x5d51BdDC648e411552846F901C734d38391a6608`
- MocaStaking: `0x88a1Dbe9568dDb8764EA10b279801E146Be6C531`
- [View on Etherscan](https://sepolia.etherscan.io/address/0x88a1Dbe9568dDb8764EA10b279801E146Be6C531#code)

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
- **Frontend**: Next.js 15, TailwindCSS, wagmi, RainbowKit, TypeScript

---

## 🧪 Testing

### Full CI/CD Pipeline
This project includes comprehensive testing across all components:

```bash
# Smart contracts (24 tests)
cd smart-contracts && npm test

# Backend API (29 tests)
cd backend && npm run test:run

# Frontend (81 tests)
cd frontend && npm run test:run
```

### CI/CD Features
- **✅ Smart Contract Tests**: Hardhat + Ethers.js
- **✅ Backend Tests**: Vitest + Node.js environment
- **✅ Frontend Tests**: Vitest + React Testing Library
- **✅ Coverage Reports**: Codecov integration
- **✅ Automated Pipeline**: GitHub Actions

---

## 🤝 Contributing

This is a code challenge project. For questions or feedback, please open an issue.

---

## 📄 License

MIT
