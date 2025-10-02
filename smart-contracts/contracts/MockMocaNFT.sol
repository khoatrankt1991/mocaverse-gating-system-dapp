// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockMocaNFT
 * @dev Standard ERC-721 NFT contract with per-token metadata URIs
 * 
 * Features:
 * - Mint NFTs with custom metadata URI
 * - Standard ERC721 transfer functionality
 * - Owner can update token URIs
 */
contract MockMocaNFT is ERC721, Ownable {
    
    // Mapping from tokenId to token URI
    mapping(uint256 => string) private _tokenURIs;
    
    // Counter for token IDs
    uint256 private _nextTokenId;
    
    // Events
    event NFTMinted(uint256 indexed tokenId, address indexed to, string uri);
    
    constructor() ERC721("Mock Moca NFT", "MOCA") Ownable(msg.sender) {
        _nextTokenId = 0; // Start token IDs from 0
    }
    
    /**
     * @dev Internal function to set token URI
     * @param tokenId Token ID
     * @param uri_ Token URI
     */
    function _setTokenURI(uint256 tokenId, string memory uri_) internal {
        _tokenURIs[tokenId] = uri_;
    }
    
    /**
     * @dev Returns the token URI for a given token ID
     * @param tokenId Token ID to query
     * @return Token URI string
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireOwned(tokenId);
        string memory uri = _tokenURIs[tokenId];
        require(bytes(uri).length > 0, "URI not set");
        return uri;
    }
    
    
    /**
     * @dev Mint a new NFT with URI
     * @param to Address to receive the NFT
     * @param uri_ Token URI for metadata (IPFS/HTTP link)
     * @return tokenId The ID of the minted token
     */
    function mint(address to, string memory uri_) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri_);
        emit NFTMinted(tokenId, to, uri_);
        return tokenId;
    }
    
    /**
     * @dev Batch mint multiple NFTs
     * @param to Address to receive the NFTs
     * @param uris Array of URIs for each token
     * @return tokenIds Array of minted token IDs
     */
    function batchMint(address to, string[] memory uris) external onlyOwner returns (uint256[] memory) {
        uint256[] memory tokenIds = new uint256[](uris.length);
        
        for (uint256 i = 0; i < uris.length; i++) {
            tokenIds[i] = mint(to, uris[i]);
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Get total number of NFTs minted
     * @return uint256 Total supply
     */
    function totalSupply() public view returns (uint256) {
        return _nextTokenId;
    }
}
