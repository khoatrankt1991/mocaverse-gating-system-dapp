import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkNFTEligibilityWithCache, invalidateNFTCache } from '../nftService'
import { createMockEnv } from '../../test/test-utils'
import type { Env } from '../../types'

// Mock the blockchain utility
vi.mock('../../utils/blockchain', () => ({
  checkNFTEligibility: vi.fn()
}))

describe('nftService', () => {
  let mockEnv: Env
  let mockKv: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockKv = {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    }
    mockEnv = createMockEnv({ 
      KV: mockKv,
      RATE_LIMIT_KV: mockKv 
    })
  })

  describe('checkNFTEligibilityWithCache', () => {
    it('should return cached result when available', async () => {
      const walletAddress = '0x1234567890abcdef1234567890abcdef12345678'
      mockKv.get.mockResolvedValue('true')

      const result = await checkNFTEligibilityWithCache(walletAddress, mockEnv)

      expect(result).toBe(true)
      expect(mockKv.get).toHaveBeenCalledWith(`nft_eligibility:${walletAddress.toLowerCase()}`)
    })

    it('should check on-chain when cache miss', async () => {
      const { checkNFTEligibility } = await import('../../utils/blockchain')
      const walletAddress = '0x1234567890abcdef1234567890abcdef12345678'
      
      mockKv.get.mockResolvedValue(null)
      vi.mocked(checkNFTEligibility).mockResolvedValue(true)
      mockKv.put.mockResolvedValue(undefined)

      const result = await checkNFTEligibilityWithCache(walletAddress, mockEnv)

      expect(result).toBe(true)
      expect(checkNFTEligibility).toHaveBeenCalledWith(walletAddress, mockEnv)
      expect(mockKv.put).toHaveBeenCalledWith(
        `nft_eligibility:${walletAddress.toLowerCase()}`,
        'true',
        { expirationTtl: 600 }
      )
    })

    it('should cache false result', async () => {
      const { checkNFTEligibility } = await import('../../utils/blockchain')
      const walletAddress = '0x1234567890abcdef1234567890abcdef12345678'
      
      mockKv.get.mockResolvedValue(null)
      vi.mocked(checkNFTEligibility).mockResolvedValue(false)
      mockKv.put.mockResolvedValue(undefined)

      const result = await checkNFTEligibilityWithCache(walletAddress, mockEnv)

      expect(result).toBe(false)
      expect(mockKv.put).toHaveBeenCalledWith(
        `nft_eligibility:${walletAddress.toLowerCase()}`,
        'false',
        { expirationTtl: 600 }
      )
    })

    it('should handle KV errors gracefully', async () => {
      const { checkNFTEligibility } = await import('../../utils/blockchain')
      const walletAddress = '0x1234567890abcdef1234567890abcdef12345678'
      
      mockKv.get.mockRejectedValue(new Error('KV error'))
      vi.mocked(checkNFTEligibility).mockResolvedValue(true)

      // Should not throw, but should fall back to blockchain check
      const result = await checkNFTEligibilityWithCache(walletAddress, mockEnv)

      expect(result).toBe(true)
      expect(checkNFTEligibility).toHaveBeenCalledWith(walletAddress, mockEnv)
    })

    it('should handle blockchain check errors', async () => {
      const { checkNFTEligibility } = await import('../../utils/blockchain')
      const walletAddress = '0x1234567890abcdef1234567890abcdef12345678'
      
      mockKv.get.mockResolvedValue(null)
      vi.mocked(checkNFTEligibility).mockRejectedValue(new Error('Blockchain error'))

      await expect(checkNFTEligibilityWithCache(walletAddress, mockEnv))
        .rejects.toThrow('Blockchain error')
    })
  })

  describe('invalidateNFTCache', () => {
    it('should delete cache key for wallet', async () => {
      const walletAddress = '0x1234567890abcdef1234567890abcdef12345678'
      mockKv.delete.mockResolvedValue(undefined)

      await invalidateNFTCache(walletAddress, mockEnv)

      expect(mockKv.delete).toHaveBeenCalledWith(`nft_eligibility:${walletAddress.toLowerCase()}`)
    })

    it('should handle KV delete errors', async () => {
      const walletAddress = '0x1234567890abcdef1234567890abcdef12345678'
      mockKv.delete.mockRejectedValue(new Error('KV delete error'))

      await expect(invalidateNFTCache(walletAddress, mockEnv))
        .rejects.toThrow('KV delete error')
    })
  })
})
