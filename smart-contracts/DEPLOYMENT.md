# Deployment Guide

## Quick Start

### 1. Environment Setup
```bash
# Install dependencies
npm install

# Set environment variables
export SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_KEY"
export PRIVATE_KEY="your_private_key"
```

### 2. Deploy Contracts
```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.ts --network sepolia
```

### 3. Verify Contracts (Optional)
```bash
# Verify on Etherscan
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

## Deployment Output

After successful deployment, you'll see:

```
🚀 Deploying contracts with account: 0x...
💰 Account balance: 0.5 ETH

📝 Deploying MockMocaNFT...
✅ MockMocaNFT deployed to: 0x...

📝 Deploying MocaStaking...
✅ MocaStaking deployed to: 0x...

============================================================
📋 DEPLOYMENT SUMMARY
============================================================
Network: sepolia
Chain ID: 11155111

📍 Contract Addresses:
  MockMocaNFT: 0x...
  MocaStaking: 0x...

🔗 Etherscan Links:
  NFT: https://sepolia.etherscan.io/address/0x...
  Staking: https://sepolia.etherscan.io/address/0x...

⚙️  Configuration for Backend/Frontend:
NFT_CONTRACT_ADDRESS=0x...
STAKING_CONTRACT_ADDRESS=0x...
============================================================
```

## Post-Deployment Setup

### 1. Update Frontend Configuration
```bash
# Update .env.local
NEXT_PUBLIC_NFT_CONTRACT=0x...
NEXT_PUBLIC_STAKING_CONTRACT=0x...
```

### 2. Mint Test NFTs
```bash
# Run admin mint script
npx hardhat run scripts/admin-mint-and-stake.ts --network sepolia
```

### 3. Configure Staking Duration
```bash
# Set shorter duration for testing (optional)
npx hardhat console --network sepolia
> const staking = await ethers.getContractAt("MocaStaking", "0x...")
> await staking.setMinStakeDuration(60) // 1 minute for testing
```

## Network Configurations

### Sepolia Testnet
```javascript
// hardhat.config.ts
sepolia: {
  url: process.env.SEPOLIA_RPC_URL,
  accounts: [process.env.PRIVATE_KEY],
  chainId: 11155111
}
```

### Local Development
```bash
# Start local node
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy.ts --network localhost
```

## Contract Verification

### Automatic Verification
```bash
# Add to hardhat.config.ts
etherscan: {
  apiKey: process.env.ETHERSCAN_API_KEY
}

# Verify after deployment
npx hardhat verify --network sepolia CONTRACT_ADDRESS [constructor_args]
```

### Manual Verification
1. Go to [Etherscan](https://sepolia.etherscan.io/)
2. Find your contract address
3. Click "Contract" tab
4. Click "Verify and Publish"
5. Upload contract source code

## Testing Deployment

### 1. Run Tests
```bash
npm test
```

### 2. Test on Deployed Contracts
```bash
# Test with deployed addresses
npx hardhat run scripts/test-deployment.ts --network sepolia
```

### 3. Frontend Integration Test
```bash
# Start frontend
cd ../frontend
npm run dev

# Test NFT verification flow
# 1. Connect wallet
# 2. Check NFT eligibility
# 3. Verify staking functionality
```

## Troubleshooting

### Common Issues

1. **Insufficient Balance**
   ```
   Error: insufficient funds for intrinsic transaction cost
   ```
   - Solution: Add more ETH to deployer account

2. **Network Connection**
   ```
   Error: could not detect network
   ```
   - Solution: Check RPC URL and network configuration

3. **Contract Verification Failed**
   ```
   Error: Contract verification failed
   ```
   - Solution: Ensure constructor arguments are correct

### Gas Optimization

For mainnet deployment, consider:
- Using `--gas-price` flag for custom gas prices
- Deploying during low network congestion
- Using gas estimation tools

## Security Checklist

- ✅ Contracts compiled without warnings
- ✅ All tests passing (24/24)
- ✅ Contracts verified on Etherscan
- ✅ Admin functions properly restricted
- ✅ No hardcoded addresses or keys
- ✅ Proper access controls implemented

## Production Deployment

### Pre-deployment
1. Audit contracts (recommended)
2. Test on testnet thoroughly
3. Prepare deployment scripts
4. Set up monitoring

### Deployment
1. Deploy to mainnet
2. Verify contracts
3. Update frontend configuration
4. Test end-to-end functionality
5. Monitor contract interactions

### Post-deployment
1. Set up contract monitoring
2. Prepare admin documentation
3. Create user guides
4. Monitor gas usage and performance
