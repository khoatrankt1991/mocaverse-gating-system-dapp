'use client'

import { useState } from 'react'
import { useReadContract } from 'wagmi'
import { mockMocaNftAbi } from '@/lib/nft-abi'

const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT as `0x${string}`

export function useNFTVerification(address?: `0x${string}`) {
  const [error, setError] = useState('')
  const [isChecking, setIsChecking] = useState(false)

  console.log('useNFTVerification - address:', address)
  console.log('useNFTVerification - NFT_CONTRACT_ADDRESS:', NFT_CONTRACT_ADDRESS)

  const { data: hasEligibleNFT, isLoading: isReadingContract, refetch, error: contractError } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: mockMocaNftAbi,
    functionName: 'hasEligibleNFT',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!NFT_CONTRACT_ADDRESS,
    },
  })

  console.log('useReadContract result:', { hasEligibleNFT, isReadingContract, contractError })

  const checkEligibility = async (): Promise<boolean> => {
    if (!address) return false
    
    setIsChecking(true)
    setError('')

    try {
      // Refetch to get latest data
      const { data } = await refetch()
      console.log('data', data)
      console.log('hasEligibleNFT', hasEligibleNFT)
      
      if (data === true) {
        return true
      } else {
        setError('No eligible Moca NFT found. Your NFT must be staked for at least 7 days.')
        return false
      }
    } catch (err) {
      console.error('Error checking eligibility:', err)
      setError(err instanceof Error ? err.message : 'Failed to verify NFT ownership')
      return false
    } finally {
      setIsChecking(false)
    }
  }

  const clearError = () => setError('')

  return {
    checkEligibility,
    isReadingContract,
    isChecking,
    error,
    clearError,
  }
}
