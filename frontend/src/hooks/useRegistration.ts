'use client'

import { useState } from 'react'
import { useSignMessage } from 'wagmi'
import { isEmailUsed, submitReservation } from '@/lib/api'
import type { GatingMethod } from '@/types'

interface RegistrationData {
  email: string
  wallet?: string
  inviteCode?: string
  registrationType: GatingMethod
}

export function useRegistration() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { signMessageAsync } = useSignMessage()

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const register = async (data: RegistrationData): Promise<boolean> => {
    setError('')

    // Validate email format
    if (!data.email.trim()) {
      setError('Please enter your email address')
      return false
    }

    if (!validateEmail(data.email)) {
      setError('Please enter a valid email address')
      return false
    }

    setIsSubmitting(true)

    try {
      // Check if email is already used
      const emailUsed = await isEmailUsed(data.email.toLowerCase())
      if (emailUsed) {
        setError('This email is already registered')
        return false
      }

      // Request signature for NFT path
      let signature = ''
      if (data.wallet) {
        try {
          const message = `Register VIP access for ${data.email}`
          signature = await signMessageAsync({ message })
        } catch {
          setError('Signature rejected. Please try again.')
          return false
        }
      }

      // Submit registration
      await submitReservation({
        email: data.email.toLowerCase(),
        wallet: data.wallet,
        inviteCode: data.inviteCode,
        signature: signature || undefined,
        registrationType: data.registrationType,
      })

      return true
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to submit registration')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearError = () => setError('')

  return {
    register,
    isSubmitting,
    error,
    clearError,
  }
}

