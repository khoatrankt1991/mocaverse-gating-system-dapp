'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

interface VIPRegistration {
  email: string
  type: 'nft' | 'invite'
  registeredAt: string
  inviteCode?: string
}

interface VIPStatusResponse {
  isVip: boolean
  message?: string
  registration?: VIPRegistration
}

export function useVIPStatus() {
  const { address, isConnected } = useAccount()
  const [vipStatus, setVipStatus] = useState<VIPStatusResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const checkVIPStatus = async (walletAddress: string) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'}/api/vip-status?wallet=${encodeURIComponent(walletAddress)}`
      )

      if (!response.ok) {
        throw new Error('Failed to check VIP status')
      }

      const data: VIPStatusResponse = await response.json()
      setVipStatus(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to check VIP status'
      )
      setVipStatus({ isVip: false, message: 'Error checking status' })
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-check VIP status when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      checkVIPStatus(address)
    } else {
      setVipStatus(null)
      setError('')
    }
  }, [isConnected, address])

  return {
    vipStatus,
    isLoading,
    error,
    isVip: vipStatus?.isVip || false,
    registration: vipStatus?.registration,
    checkVIPStatus,
    refetch: () => address && checkVIPStatus(address),
  }
}
