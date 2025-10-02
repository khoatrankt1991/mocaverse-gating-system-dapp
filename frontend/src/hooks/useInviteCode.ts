'use client'

import { useState } from 'react'
import { verifyInviteCode } from '@/lib/api'

export function useInviteCode() {
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string>('')

  const verifyCode = async (code: string): Promise<boolean> => {
    setError('')

    // Basic validation
    if (!code.trim()) {
      setError('Please enter an invite code')
      return false
    }

    if (!code.toUpperCase().startsWith('MOCA-')) {
      setError('Invite code must start with MOCA-')
      return false
    }

    setIsVerifying(true)

    try {
      const result = await verifyInviteCode(code.toUpperCase())

      if (result.valid) {
        return true
      } else {
        setError(result.message || 'Invalid or expired invite code')
        return false
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to verify invite code'
      )
      return false
    } finally {
      setIsVerifying(false)
    }
  }

  const clearError = () => setError('')

  return {
    verifyCode,
    isVerifying,
    error,
    clearError,
  }
}
