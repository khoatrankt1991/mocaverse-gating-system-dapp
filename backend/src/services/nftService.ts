import type { Env } from '../types';
import { checkNFTEligibility } from '../utils/blockchain';

const CACHE_TTL = 600; // 10 minutes

/**
 * Check NFT eligibility with KV caching
 */
export async function checkNFTEligibilityWithCache(
  walletAddress: string,
  env: Env
): Promise<boolean> {
  const cacheKey = `nft_eligibility:${walletAddress.toLowerCase()}`;
  
  // Try to get from cache
  try {
    const cached = await env.KV.get(cacheKey);
    if (cached !== null) {
      return cached === 'true';
    }
  } catch (error) {
    // If KV fails, continue to blockchain check
    console.warn('KV cache miss, falling back to blockchain check:', error);
  }
  
  // Check on-chain
  const isEligible = await checkNFTEligibility(walletAddress, env);
  
  // Cache the result (don't fail if KV is down)
  try {
    await env.KV.put(cacheKey, isEligible.toString(), { expirationTtl: CACHE_TTL });
  } catch (error) {
    console.warn('Failed to cache result:', error);
  }
  
  return isEligible;
}

/**
 * Invalidate NFT eligibility cache for a wallet
 */
export async function invalidateNFTCache(
  walletAddress: string,
  env: Env
): Promise<void> {
  const cacheKey = `nft_eligibility:${walletAddress.toLowerCase()}`;
  await env.KV.delete(cacheKey);
}

