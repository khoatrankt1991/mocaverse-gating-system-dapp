# Moca Gating System - Smart Contracts

## Overview

This repository contains the smart contracts for the Moca Gating System, implementing NFT-based access control with staking mechanisms.

## Architecture

### Contracts

1. **MockMocaNFT** (`contracts/MockMocaNFT.sol`)
   - ERC721 NFT contract for testing
   - Supports per-token metadata URIs
   - Owner can mint NFTs with custom URIs

2. **MocaStaking** (`contracts/MocaStaking.sol`)
   - Staking contract for Moca NFTs
   - Users transfer NFTs to stake them
   - Tracks staking duration and eligibility
   - Marketplace pattern - contract holds NFT while staked

## Features

### MockMocaNFT
- ✅ ERC721 standard implementation
- ✅ Per-token metadata URIs
- ✅ Owner-only minting
- ✅ URI updates for existing tokens

### MocaStaking
- ✅ Stake NFTs by transferring to contract
- ✅ Unstake NFTs by index
- ✅ Configurable minimum staking duration (default: 7 days)
- ✅ Eligibility checks for staked NFTs
- ✅ Multiple NFT staking per user
- ✅ Security: ReentrancyGuard, Ownable
- ✅ Gas efficient: Index-based operations

## Contract Functions

### MockMocaNFT

```solidity
// Mint new NFT
function mint(address to, uint256 tokenId, string memory uri_) external onlyOwner

// Update token URI
function updateTokenURI(uint256 tokenId, string memory newUri) external onlyOwner

// Get token URI
function tokenURI(uint256 tokenId) public view returns (string memory)
```

### MocaStaking

```solidity
// Stake NFT
function stake(uint256 tokenId) external nonReentrant

// Unstake NFT by index
function unstake(uint256 index) external nonReentrant

// Check if user has eligible NFT
function hasEligibleNFT(address user) public view returns (bool)

// Get user's stakes
function getUserStakes(address user) public view returns (StakeInfo[] memory)

// Check if specific stake is eligible
function isStakedLongEnough(address user, uint256 index) public view returns (bool)

// Admin: Set minimum stake duration
function setMinStakeDuration(uint256 _duration) external onlyOwner
```

## Data Structures

### StakeInfo
```solidity
struct StakeInfo {
    uint256 tokenId;    // Token ID that was staked
    uint256 stakedAt;   // Timestamp when NFT was staked
    bool claimed;       // Whether rewards have been claimed
}
```

## Deployment

### Prerequisites
- Node.js 18+
- Hardhat
- MetaMask or compatible wallet

### Setup
```bash
npm install
```

### Deploy to Sepolia Testnet
```bash
# Set environment variables
export SEPOLIA_RPC_URL="your_sepolia_rpc_url"
export PRIVATE_KEY="your_private_key"

# Deploy contracts
npx hardhat run scripts/deploy.ts --network sepolia
```

### Deploy to Local Network
```bash
# Start local node
npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy.ts --network localhost
```

### Contract Addresses (Sepolia)
- **MockMocaNFT:** `0x5d51BdDC648e411552846F901C734d38391a6608`
- **MocaStaking:** `0x88a1Dbe9568dDb8764EA10b279801E146Be6C531`

See [CONTRACT_ADDRESSES.md](docs/CONTRACT_ADDRESSES.md) for full details.

## Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
# Test MocaStaking contract
npm test -- --grep "MocaStaking"

# Test MockMocaNFT contract
npm test -- --grep "MockMocaNFT"
```

### Test Coverage
- ✅ **24/24 MocaStaking tests pass (100%)**
- ✅ **All core functionality tested**
- ✅ **Edge cases covered**
- ✅ **Security scenarios tested**

## Configuration

### Environment Variables
```bash
# Network configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_private_key

# Contract addresses (Sepolia)
NFT_CONTRACT_ADDRESS=0x5d51BdDC648e411552846F901C734d38391a6608
STAKING_CONTRACT_ADDRESS=0x88a1Dbe9568dDb8764EA10b279801E146Be6C531
```

### Frontend Integration
```javascript
// Contract addresses (Sepolia)
const NFT_CONTRACT = "0x5d51BdDC648e411552846F901C734d38391a6608";
const STAKING_CONTRACT = "0x88a1Dbe9568dDb8764EA10b279801E146Be6C531";

// Check eligibility
const hasEligible = await stakingContract.hasEligibleNFT(userAddress);

// Get user stakes
const stakes = await stakingContract.getUserStakes(userAddress);
```

## Security Features

- ✅ **ReentrancyGuard** - Prevents reentrancy attacks
- ✅ **Ownable** - Admin-only functions protected
- ✅ **Input validation** - Proper parameter checks
- ✅ **Safe transfers** - ERC721 safeTransferFrom
- ✅ **Claimed flags** - Prevent double unstaking

## Gas Optimization

- ✅ **Index-based operations** - No loops for unstaking
- ✅ **Efficient storage** - Array-based user stakes
- ✅ **Minimal external calls** - Optimized contract interactions

## Usage Examples

### Staking Flow
1. User approves NFT to staking contract
2. User calls `stake(tokenId)` to transfer NFT
3. Contract tracks staking timestamp
4. After minimum duration, NFT becomes eligible

### Unstaking Flow
1. User calls `getUserStakes()` to get stake array
2. User finds index of NFT to unstake
3. User calls `unstake(index)` to retrieve NFT
4. Contract marks stake as claimed

### Eligibility Check
1. Frontend calls `hasEligibleNFT(user)` 
2. Contract checks if any stake meets duration requirement
3. Returns true/false for access control

## Network Support

- ✅ **Sepolia Testnet** - For testing
- ✅ **Local Hardhat** - For development
- ✅ **Mainnet Ready** - Production deployment ready

## License

MIT License - see LICENSE file for details.

## Support

For questions or issues, please create an issue in the repository.