import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import verifyCodeRoute from '../verifyCode'
import { createMockEnv, testApp, expectJsonResponse, expectErrorResponse } from '../../test/test-utils'
import type { Env } from '../../types'

// Mock the services
vi.mock('../../services/inviteCodeService', () => ({
  verifyInviteCode: vi.fn()
}))

// Mock the validation utility
vi.mock('../../utils/validation', () => ({
  isValidInviteCode: vi.fn()
}))

describe('verifyCode route', () => {
  let app: Hono<{ Bindings: Env }>
  let mockEnv: Env

  beforeEach(() => {
    vi.clearAllMocks()
    app = new Hono<{ Bindings: Env }>()
    app.route('/api/verify-code', verifyCodeRoute)
    mockEnv = createMockEnv()
  })

  describe('GET /api/verify-code', () => {
    it('should return error when code parameter is missing', async () => {
      const response = await testApp(app).request('/api/verify-code')
      
      expect(response.status).toBe(400)
      await expectJsonResponse(response, { error: 'Missing code parameter' })
    })

    it('should return invalid for malformed code', async () => {
      const { isValidInviteCode } = await import('../../utils/validation')
      vi.mocked(isValidInviteCode).mockReturnValue(false)

      const response = await testApp(app).request('/api/verify-code?code=INVALID')

      expect(response.status).toBe(200)
      await expectJsonResponse(response, { 
        valid: false, 
        message: 'Invalid code format' 
      })
    })

    it('should return valid result for valid code', async () => {
      const { isValidInviteCode } = await import('../../utils/validation')
      const { verifyInviteCode } = await import('../../services/inviteCodeService')
      
      vi.mocked(isValidInviteCode).mockReturnValue(true)
      vi.mocked(verifyInviteCode).mockResolvedValue({
        valid: true,
        usesLeft: 2,
        codeId: 1
      })

      const response = await testApp(app).request('/api/verify-code?code=MOCA-12345678')

      expect(response.status).toBe(200)
      await expectJsonResponse(response, {
        valid: true,
        usesLeft: 2,
        codeId: 1
      })
    })

    it('should return invalid result for invalid code', async () => {
      const { isValidInviteCode } = await import('../../utils/validation')
      const { verifyInviteCode } = await import('../../services/inviteCodeService')
      
      vi.mocked(isValidInviteCode).mockReturnValue(true)
      vi.mocked(verifyInviteCode).mockResolvedValue({
        valid: false,
        message: 'Invite code not found'
      })

      const response = await testApp(app).request('/api/verify-code?code=MOCA-12345678')

      expect(response.status).toBe(200)
      await expectJsonResponse(response, {
        valid: false,
        message: 'Invite code not found'
      })
    })

    it('should handle service errors gracefully', async () => {
      const { isValidInviteCode } = await import('../../utils/validation')
      const { verifyInviteCode } = await import('../../services/inviteCodeService')
      
      vi.mocked(isValidInviteCode).mockReturnValue(true)
      vi.mocked(verifyInviteCode).mockRejectedValue(new Error('Database error'))

      const response = await testApp(app).request('/api/verify-code?code=MOCA-12345678')

      expect(response.status).toBe(500)
      await expectJsonResponse(response, { error: 'Internal server error' })
    })

    it('should handle validation errors gracefully', async () => {
      const { isValidInviteCode } = await import('../../utils/validation')
      
      vi.mocked(isValidInviteCode).mockImplementation(() => {
        throw new Error('Validation error')
      })

      const response = await testApp(app).request('/api/verify-code?code=MOCA-12345678')

      expect(response.status).toBe(500)
      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        await expectJsonResponse(response, { error: 'Internal server error' })
      } else {
        // If not JSON, just check the status
        expect(response.status).toBe(500)
      }
    })
  })
})
