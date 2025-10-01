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
  const cached = await env.KV.get(cacheKey);
  if (cached !== null) {
    return cached === 'true';
  }
  
  // Check on-chain
  const isEligible = await checkNFTEligibility(walletAddress, env);
  
  // Cache the result
  await env.KV.put(cacheKey, isEligible.toString(), { expirationTtl: CACHE_TTL });
  
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

