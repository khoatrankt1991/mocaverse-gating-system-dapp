import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateInviteCode, verifyInviteCode, incrementCodeUsage } from '../inviteCodeService'
import { createMockEnv, mockDbResult, mockDbError } from '../../test/test-utils'
import type { Env } from '../../types'

// Mock the code generator
vi.mock('../../utils/codeGenerator', () => ({
  generateUniqueCode: vi.fn().mockResolvedValue('TEST123')
}))

describe('inviteCodeService', () => {
  let mockEnv: Env
  let mockDb: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn(),
          run: vi.fn(),
        }),
      }),
    }
    mockEnv = createMockEnv({ DB: mockDb })
  })

  describe('generateInviteCode', () => {
    it('should generate a new invite code with default values', async () => {
      const mockResult = {
        meta: { last_row_id: 1 }
      }
      mockDb.prepare().bind().run.mockResolvedValue(mockResult)

      const result = await generateInviteCode(mockEnv)

      expect(result).toEqual({
        id: 1,
        code: 'TEST123',
        referrer_email: null,
        max_uses: 1,
        current_uses: 0,
        created_at: expect.any(Number),
        is_active: 1
      })

      expect(mockDb.prepare).toHaveBeenCalledWith(
        'INSERT INTO invite_codes (code, referrer_email, max_uses, current_uses, created_at, is_active) VALUES (?, ?, ?, 0, ?, 1)'
      )
    })

    it('should generate a new invite code with custom values', async () => {
      const mockResult = {
        meta: { last_row_id: 2 }
      }
      mockDb.prepare().bind().run.mockResolvedValue(mockResult)

      const result = await generateInviteCode(mockEnv, 'referrer@example.com', 5)

      expect(result).toEqual({
        id: 2,
        code: 'TEST123',
        referrer_email: 'referrer@example.com',
        max_uses: 5,
        current_uses: 0,
        created_at: expect.any(Number),
        is_active: 1
      })

      expect(mockDb.prepare().bind).toHaveBeenCalledWith(
        'TEST123',
        'referrer@example.com',
        5,
        expect.any(Number)
      )
    })

    it('should handle database errors', async () => {
      mockDb.prepare().bind().run.mockRejectedValue(new Error('Database error'))

      await expect(generateInviteCode(mockEnv)).rejects.toThrow('Database error')
    })
  })

  describe('verifyInviteCode', () => {
    it('should return valid for active code with uses left', async () => {
      const mockCode = {
        id: 1,
        code: 'TEST123',
        referrer_email: null,
        max_uses: 3,
        current_uses: 1,
        created_at: Date.now(),
        is_active: 1
      }
      mockDb.prepare().bind().first.mockResolvedValue(mockCode)

      const result = await verifyInviteCode('TEST123', mockEnv)

      expect(result).toEqual({
        valid: true,
        usesLeft: 2,
        codeId: 1
      })
    })

    it('should return invalid for non-existent code', async () => {
      mockDb.prepare().bind().first.mockResolvedValue(null)

      const result = await verifyInviteCode('INVALID', mockEnv)

      expect(result).toEqual({
        valid: false,
        message: 'Invite code not found'
      })
    })

    it('should return invalid for inactive code', async () => {
      const mockCode = {
        id: 1,
        code: 'TEST123',
        referrer_email: null,
        max_uses: 3,
        current_uses: 1,
        created_at: Date.now(),
        is_active: 0
      }
      mockDb.prepare().bind().first.mockResolvedValue(mockCode)

      const result = await verifyInviteCode('TEST123', mockEnv)

      expect(result).toEqual({
        valid: false,
        message: 'Invite code is no longer active'
      })
    })

    it('should return invalid for exhausted code', async () => {
      const mockCode = {
        id: 1,
        code: 'TEST123',
        referrer_email: null,
        max_uses: 3,
        current_uses: 3,
        created_at: Date.now(),
        is_active: 1
      }
      mockDb.prepare().bind().first.mockResolvedValue(mockCode)

      const result = await verifyInviteCode('TEST123', mockEnv)

      expect(result).toEqual({
        valid: false,
        message: 'Invite code has no uses left'
      })
    })

    it('should handle database errors', async () => {
      mockDb.prepare().bind().first.mockRejectedValue(new Error('Database error'))

      await expect(verifyInviteCode('TEST123', mockEnv)).rejects.toThrow('Database error')
    })
  })

  describe('incrementCodeUsage', () => {
    it('should increment usage count for valid code ID', async () => {
      const mockResult = { meta: { changes: 1 } }
      mockDb.prepare().bind().run.mockResolvedValue(mockResult)

      await incrementCodeUsage(1, mockEnv)

      expect(mockDb.prepare).toHaveBeenCalledWith(
        'UPDATE invite_codes SET current_uses = current_uses + 1 WHERE id = ?'
      )
      expect(mockDb.prepare().bind).toHaveBeenCalledWith(1)
    })

    it('should handle database errors', async () => {
      mockDb.prepare().bind().run.mockRejectedValue(new Error('Database error'))

      await expect(incrementCodeUsage(1, mockEnv)).rejects.toThrow('Database error')
    })
  })
})
