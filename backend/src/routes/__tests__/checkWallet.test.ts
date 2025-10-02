import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import checkWalletRoute from '../checkWallet'
import { createMockEnv, testApp, expectJsonResponse, expectErrorResponse } from '../../test/test-utils'
import type { Env } from '../../types'

// Mock the services
vi.mock('../../services/emailService', () => ({
  isWalletUsed: vi.fn()
}))

describe('checkWallet route', () => {
  let app: Hono<{ Bindings: Env }>
  let mockEnv: Env

  beforeEach(() => {
    vi.clearAllMocks()
    app = new Hono<{ Bindings: Env }>()
    app.route('/api/check-wallet', checkWalletRoute)
    mockEnv = createMockEnv()
  })

  describe('GET /api/check-wallet', () => {
    it('should return error when wallet parameter is missing', async () => {
      const response = await testApp(app).request('/api/check-wallet')
      
      expect(response.status).toBe(400)
      await expectJsonResponse(response, { error: 'Missing wallet parameter' })
    })

    it('should return error for invalid wallet address format', async () => {
      const response = await testApp(app).request('/api/check-wallet?wallet=invalid-address')
      
      expect(response.status).toBe(400)
      await expectJsonResponse(response, { error: 'Invalid wallet address format' })
    })

    it('should return used: false for unused wallet', async () => {
      const { isWalletUsed } = await import('../../services/emailService')
      vi.mocked(isWalletUsed).mockResolvedValue(false)

      const response = await testApp(app).request('/api/check-wallet?wallet=0x1234567890abcdef1234567890abcdef12345678')

      expect(response.status).toBe(200)
      await expectJsonResponse(response, { used: false })
    })

    it('should return used: true for used wallet', async () => {
      const { isWalletUsed } = await import('../../services/emailService')
      vi.mocked(isWalletUsed).mockResolvedValue(true)

      const response = await testApp(app).request('/api/check-wallet?wallet=0x1234567890abcdef1234567890abcdef12345678')

      expect(response.status).toBe(200)
      await expectJsonResponse(response, { used: true })
    })

    it('should handle service errors gracefully', async () => {
      const { isWalletUsed } = await import('../../services/emailService')
      vi.mocked(isWalletUsed).mockRejectedValue(new Error('Database error'))

      const response = await testApp(app).request('/api/check-wallet?wallet=0x1234567890abcdef1234567890abcdef12345678')

      expect(response.status).toBe(500)
      await expectJsonResponse(response, { error: 'Internal server error' })
    })

    it('should handle validation errors gracefully', async () => {
      const response = await testApp(app).request('/api/check-wallet?wallet=invalid')
      
      expect(response.status).toBe(400)
      await expectJsonResponse(response, { error: 'Invalid wallet address format' })
    })
  })
})
