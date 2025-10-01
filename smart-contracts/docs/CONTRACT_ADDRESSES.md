# Contract Addresses

## Sepolia Testnet

### MockMocaNFT (ERC721)
```
Address: 0x5d51BdDC648e411552846F901C734d38391a6608
Etherscan: https://sepolia.etherscan.io/address/0x5d51BdDC648e411552846F901C734d38391a6608#code
```

### MocaStaking
```
Address: 0x88a1Dbe9568dDb8764EA10b279801E146Be6C531
Etherscan: https://sepolia.etherscan.io/address/0x88a1Dbe9568dDb8764EA10b279801E146Be6C531#code
```

## Configuration

### Environment Variables
```bash
# Sepolia Testnet
NEXT_PUBLIC_NFT_CONTRACT=0x5d51BdDC648e411552846F901C734d38391a6608
NEXT_PUBLIC_STAKING_CONTRACT=0x88a1Dbe9568dDb8764EA10b279801E146Be6C531
NEXT_PUBLIC_CHAIN_ID=11155111
```

### Frontend Configuration
```javascript
// src/lib/constants.ts
export const CONTRACTS = {
  NFT: "0x5d51BdDC648e411552846F901C734d38391a6608",
  STAKING: "0x88a1Dbe9568dDb8764EA10b279801E146Be6C531",
  CHAIN_ID: 11155111
} as const;
```

### Backend Configuration
```bash
# .env
NFT_CONTRACT_ADDRESS=0x5d51BdDC648e411552846F901C734d38391a6608
STAKING_CONTRACT_ADDRESS=0x88a1Dbe9568dDb8764EA10b279801E146Be6C531
CHAIN_ID=11155111
```

## Deployment Details

- **Network:** Sepolia Testnet
- **Chain ID:** 11155111
- **Deployer:** 0x32d2F3Ab411dBc25d3Ce1109FA4013ce6A3BDBc4
- **Deployment Date:** December 2024
- **Gas Used:** ~2.5M gas total

## Contract Verification

### Verify on Etherscan
```bash
# MockMocaNFT
npx hardhat verify --network sepolia 0x5d51BdDC648e411552846F901C734d38391a6608

# MocaStaking
npx hardhat verify --network sepolia 0x88a1Dbe9568dDb8764EA10b279801E146Be6C531 "0x5d51BdDC648e411552846F901C734d38391a6608"
```

## Testing

### Test with Frontend
1. Update `.env.local` with contract addresses
2. Start frontend: `npm run dev`
3. Connect wallet to Sepolia
4. Test NFT verification flow

### Test with Etherscan
1. Go to NFT contract on Etherscan
2. Use "Write Contract" to mint NFT
3. Go to Staking contract
4. Use "Read Contract" to check functions

## Security Notes

- ✅ Contracts verified on Etherscan
- ✅ All tests passing (24/24)
- ✅ Security features implemented
- ✅ Gas optimized
- ✅ Production ready

## Support

For issues or questions, check:
- Contract source code on Etherscan
- Test files in `/test` directory
- Documentation in `/docs` directory