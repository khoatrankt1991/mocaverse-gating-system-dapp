# MockMocaNFT Smart Contract

## 📋 Overview

ERC-721 NFT contract with staking mechanism for the Moca VIP gating system. Users must stake their NFT for at least 7 days to be eligible for VIP access.

**Tech Stack**: Solidity 0.8.20 + Hardhat + TypeScript + OpenZeppelin

## 🎯 Features

- **ERC-721 Standard**: Fully compliant NFT implementation
- **Staking Mechanism**: Lock NFTs and track staking duration
- **Eligibility Check**: Verify if NFT has been staked ≥ 7 days
- **Transfer Protection**: Prevent transfer of staked NFTs
- **User Verification**: Check if user has any eligible NFT

## 🔧 Key Functions

### Minting
```solidity
function mint(address to) public returns (uint256)
```
Mint a new NFT to the specified address.

### Staking
```solidity
function stake(uint256 tokenId) public
function unstake(uint256 tokenId) public
```
Stake/unstake an NFT (must be owner).

### Eligibility
```solidity
function isStakedLongEnough(uint256 tokenId) public view returns (bool)
```
Check if a specific NFT has been staked for ≥ 7 days.

```solidity
function hasEligibleNFT(address user) public view returns (bool)
```
Check if a user has at least one eligible NFT (used by backend).

### Utilities
```solidity
function getStakeInfo(uint256 tokenId) public view returns (uint256 stakedAt, bool isStaked, uint256 duration)
```
Get detailed staking information for a token.

## 🚀 Setup & Deployment

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in:
```bash
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_key  # Optional, for verification
```

### 3. Compile Contract
```bash
npm run compile
```

### 4. Run Tests
```bash
npm test
```

### 5. Deploy to Sepolia
```bash
npm run deploy:sepolia
```

Save the deployed contract address - you'll need it for backend and frontend configuration.

## 🧪 Testing

The test suite covers:
- ✅ Basic minting and ownership
- ✅ Staking/unstaking mechanics
- ✅ Transfer restrictions for staked NFTs
- ✅ Time-based eligibility (using Hardhat time manipulation)
- ✅ Multi-user scenarios
- ✅ Edge cases (multiple stake cycles, etc.)

Run tests:
```bash
npm test
```

## 📝 Technical Details

### Staking Duration
- **Minimum**: 7 days (604,800 seconds)
- **Tracking**: On-chain via `block.timestamp`

### Transfer Restrictions
- Staked NFTs cannot be transferred
- Must unstake before transferring
- Minting and burning are not restricted

### Gas Optimization Notes
- `hasEligibleNFT()` iterates through all tokens - consider maintaining user→tokens mapping for production
- Current implementation is optimized for clarity and testing

## 🔐 Security Considerations

- Only NFT owner can stake/unstake
- Staked NFTs are locked from transfers
- No admin functions to manipulate stakes
- Timestamp-based logic (be aware of miner manipulation limits)

## 📊 Events

```solidity
event NFTMinted(uint256 indexed tokenId, address indexed to);
event NFTStaked(uint256 indexed tokenId, address indexed owner, uint256 timestamp);
event NFTUnstaked(uint256 indexed tokenId, address indexed owner, uint256 timestamp);
```

## 🎯 Next Steps

After deployment:
1. ✅ Save contract address
2. ✅ Configure backend with contract address and ABI
3. ✅ Mint test NFTs for testing
4. ✅ Stake some NFTs and wait/time-travel for eligibility

