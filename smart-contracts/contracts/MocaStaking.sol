// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface MocaNftToken {
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function ownerOf(uint256 tokenId) external view returns (address);
}

/**
 * @title MocaStaking
 * @dev Staking contract for Moca NFTs
 * 
 * Users transfer their NFTs to this contract to stake them.
 * The contract tracks staking timestamps and eligibility.
 * Similar to marketplace pattern - contract holds the NFT while staked.
 */
contract MocaStaking is ReentrancyGuard, ERC721Holder, Ownable {
    
    // Struct to store staking information
    struct StakeInfo {
        uint256 tokenId;      // Original owner who staked
        uint256 stakedAt;   // Timestamp when NFT was staked
        bool claimed;       // Whether rewards have been claimed
    }
    
    // Mapping: user => StakeInfo
    mapping(address => StakeInfo[]) public userStakes;
    
    // Minimum staking duration: 7 days = 604800 seconds (configurable for testing)
    uint256 public MIN_STAKE_DURATION = 604800; // 7 * 24 * 60 * 60
    
    // Moca NFT contract
    MocaNftToken public mocaNFT;
    
    // Events
    event NFTStaked(address indexed nft, uint256 indexed tokenId, address indexed owner, uint256 timestamp);
    event NFTUnstaked(address indexed nft, uint256 indexed tokenId, address indexed owner, uint256 timestamp);
    
    constructor(address _mocaNFT) Ownable(msg.sender) {
        require(_mocaNFT != address(0), "Invalid NFT address");
        mocaNFT = MocaNftToken(_mocaNFT);
    }
    
    /**
     * @dev Stake an NFT by transferring it to this contract
     * @param tokenId The ID of the token to stake
     */
    function stake(uint256 tokenId) external nonReentrant {
        // Check if already staked by this user
        StakeInfo[] storage userStakeList = userStakes[msg.sender];
        for (uint256 i = 0; i < userStakeList.length; i++) {
            require(userStakeList[i].tokenId != tokenId, "Already staked");
        }
        
        // Transfer NFT from user to this contract
        mocaNFT.safeTransferFrom(msg.sender, address(this), tokenId);
        
        // Add to user's stake list
        userStakes[msg.sender].push(StakeInfo({
            tokenId: tokenId,
            stakedAt: block.timestamp,
            claimed: false
        }));
        
        emit NFTStaked(address(mocaNFT), tokenId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Unstake an NFT by index and return it to owner
     * @param index Index in user's stake array
     */
    function unstake(uint256 index) external nonReentrant {
        require(index < userStakes[msg.sender].length, "Invalid index");
        StakeInfo storage stakeInfo = userStakes[msg.sender][index];
        require(!stakeInfo.claimed, "Already claimed");
        
        uint256 tokenId = stakeInfo.tokenId;
        
        // Mark as claimed
        stakeInfo.claimed = true;
        
        // Transfer NFT back to owner
        mocaNFT.safeTransferFrom(address(this), msg.sender, tokenId);
        
        emit NFTUnstaked(address(mocaNFT), tokenId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Check if a specific stake has been staked for at least 7 days
     * @param user User address
     * @param index Index in user's stake array
     * @return bool True if staked for >= 7 days, false otherwise
     */
    function isStakedLongEnough(address user, uint256 index) public view returns (bool) {
        require(index < userStakes[user].length, "Invalid index");
        StakeInfo memory stakeInfo = userStakes[user][index];
        
        uint256 stakeDuration = block.timestamp - stakeInfo.stakedAt;
        return stakeDuration >= MIN_STAKE_DURATION;
    }
    
    /**
     * @dev Check if a user has at least one eligible NFT (staked >= 7 days)
     * @param user Address of the user to check
     * @return bool True if user has at least one eligible NFT
     */
    function hasEligibleNFT(address user) public view returns (bool) {
        StakeInfo[] memory userStakeList = userStakes[user];
        
        for (uint256 i = 0; i < userStakeList.length; i++) {
            uint256 stakeDuration = block.timestamp - userStakeList[i].stakedAt;
            if (stakeDuration >= MIN_STAKE_DURATION) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * @dev Get all stakes for a user
     * @param user User address
     * @return stakes Array of user's stakes
     */
    function getUserStakes(address user) public view returns (StakeInfo[] memory) {
        return userStakes[user];
    }
    
    /**
     * @dev Admin function to set minimum stake duration (for testing)
     * @param _duration New minimum duration in seconds
     */
    function setMinStakeDuration(uint256 _duration) external onlyOwner {
        MIN_STAKE_DURATION = _duration;
    }
    
    /**
     * @dev Helper to get total supply from NFT contract
     */
    function _getTotalSupply() internal view returns (uint256) {
        // Try to call totalSupply() if it exists
        (bool success, bytes memory data) = address(mocaNFT).staticcall(
            abi.encodeWithSignature("totalSupply()")
        );
        
        if (success && data.length > 0) {
            return abi.decode(data, (uint256));
        }
        
        // Fallback: reasonable limit for iteration
        return 1000;
    }
}

