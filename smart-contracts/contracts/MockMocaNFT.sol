// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockMocaNFT
 * @dev ERC-721 NFT contract with staking mechanism for VIP gating system
 * 
 * Features:
 * - Mint NFTs to users
 * - Stake NFTs (locks them, tracks timestamp)
 * - Check if NFT has been staked for >= 7 days
 * - Check if a user has any eligible NFT
 */
contract MockMocaNFT is ERC721, Ownable {
    
    // Struct to store staking information
    struct StakeInfo {
        uint256 stakedAt;  // Timestamp when NFT was staked
        bool isStaked;     // Whether NFT is currently staked
    }
    
    // Mapping from tokenId to stake info
    mapping(uint256 => StakeInfo) public stakes;
    
    // Counter for token IDs
    uint256 private _nextTokenId;
    
    // Minimum staking duration (7 days in seconds)
    uint256 public constant MIN_STAKE_DURATION = 7 days;
    
    // Events
    event NFTStaked(uint256 indexed tokenId, address indexed owner, uint256 timestamp);
    event NFTUnstaked(uint256 indexed tokenId, address indexed owner, uint256 timestamp);
    event NFTMinted(uint256 indexed tokenId, address indexed to);
    
    constructor() ERC721("Mock Moca NFT", "MOCA") Ownable(msg.sender) {
        _nextTokenId = 1; // Start token IDs from 1
    }
    
    /**
     * @dev Mint a new NFT to the specified address
     * @param to Address to receive the NFT
     * @return tokenId The ID of the minted token
     */
    function mint(address to) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        emit NFTMinted(tokenId, to);
        return tokenId;
    }
    
    /**
     * @dev Stake an NFT (must be owner)
     * @param tokenId The ID of the token to stake
     */
    function stake(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(!stakes[tokenId].isStaked, "Already staked");
        
        stakes[tokenId] = StakeInfo({
            stakedAt: block.timestamp,
            isStaked: true
        });
        
        emit NFTStaked(tokenId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Unstake an NFT (must be owner)
     * @param tokenId The ID of the token to unstake
     */
    function unstake(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(stakes[tokenId].isStaked, "Not staked");
        
        stakes[tokenId].isStaked = false;
        // Note: We keep stakedAt for historical record
        
        emit NFTUnstaked(tokenId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Check if a specific NFT has been staked for at least 7 days
     * @param tokenId The ID of the token to check
     * @return bool True if staked for >= 7 days, false otherwise
     */
    function isStakedLongEnough(uint256 tokenId) public view returns (bool) {
        StakeInfo memory stakeInfo = stakes[tokenId];
        
        if (!stakeInfo.isStaked) {
            return false;
        }
        
        uint256 stakeDuration = block.timestamp - stakeInfo.stakedAt;
        return stakeDuration >= MIN_STAKE_DURATION;
    }
    
    /**
     * @dev Check if a user has at least one eligible NFT (staked >= 7 days)
     * @param user Address of the user to check
     * @return bool True if user has at least one eligible NFT
     * 
     * Note: This function iterates through all minted tokens. 
     * In production, consider maintaining a user->tokens mapping for gas optimization.
     */
    function hasEligibleNFT(address user) public view returns (bool) {
        // Iterate through all possible token IDs
        for (uint256 tokenId = 1; tokenId < _nextTokenId; tokenId++) {
            // Check if token exists and user owns it
            try this.ownerOf(tokenId) returns (address owner) {
                if (owner == user && isStakedLongEnough(tokenId)) {
                    return true;
                }
            } catch {
                // Token doesn't exist or was burned, continue
                continue;
            }
        }
        
        return false;
    }
    
    /**
     * @dev Get total number of NFTs minted
     * @return uint256 Total supply
     */
    function totalSupply() public view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    /**
     * @dev Get stake info for a token
     * @param tokenId The token ID to query
     * @return stakedAt Timestamp when staked
     * @return isStaked Whether currently staked
     * @return duration How long it's been staked (0 if not staked)
     */
    function getStakeInfo(uint256 tokenId) public view returns (
        uint256 stakedAt,
        bool isStaked,
        uint256 duration
    ) {
        StakeInfo memory info = stakes[tokenId];
        stakedAt = info.stakedAt;
        isStaked = info.isStaked;
        duration = info.isStaked ? (block.timestamp - info.stakedAt) : 0;
    }
    
    /**
     * @dev Override to prevent transfer of staked NFTs
     * @param to Address receiving the token
     * @param tokenId Token ID being transferred
     * @param auth Address authorized to perform the update
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Prevent transfer if staked (except minting and burning)
        if (from != address(0) && to != address(0)) {
            require(!stakes[tokenId].isStaked, "Cannot transfer staked NFT");
        }
        
        return super._update(to, tokenId, auth);
    }
}

