import { ethers } from 'ethers';
import type { Env } from '../types';

// MockMocaNFT ABI (only the functions we need)
const NFT_ABI = [
  'function hasEligibleNFT(address user) view returns (bool)',
  'function isStakedLongEnough(uint256 tokenId) view returns (bool)',
  'function ownerOf(uint256 tokenId) view returns (address)'
];

/**
 * Check if a wallet address has an eligible NFT (staked >= 7 days)
 */
export async function checkNFTEligibility(
  walletAddress: string,
  env: Env
): Promise<boolean> {
  try {
    // Create provider
    const provider = new ethers.JsonRpcProvider(env.SEPOLIA_RPC_URL);
    
    // Create contract instance
    const contract = new ethers.Contract(
      env.NFT_CONTRACT_ADDRESS,
      NFT_ABI,
      provider
    );
    
    // Call hasEligibleNFT function
    const isEligible = await contract.hasEligibleNFT(walletAddress);
    
    return isEligible;
  } catch (error) {
    console.error('Error checking NFT eligibility:', error);
    throw new Error('Failed to verify NFT eligibility');
  }
}

/**
 * Verify wallet signature (message signing for ownership proof)
 */
export function verifyWalletSignature(
  message: string,
  signature: string,
  expectedAddress: string
): boolean {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

