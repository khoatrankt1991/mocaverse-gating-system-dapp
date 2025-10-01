import type { ApiResponse, InviteCodeResponse, NFTEligibilityResponse, RegistrationData } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

export async function verifyInviteCode(code: string): Promise<InviteCodeResponse> {
  const response = await fetch(`${API_URL}/api/verifyCode?code=${encodeURIComponent(code)}`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to verify invite code')
  }
  
  return response.json()
}

export async function checkNFTEligibility(wallet: string): Promise<NFTEligibilityResponse> {
  const response = await fetch(`${API_URL}/api/checkWallet?wallet=${encodeURIComponent(wallet)}`)
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to check NFT eligibility')
  }
  
  return response.json()
}

export async function isEmailUsed(email: string): Promise<boolean> {
  const response = await fetch(`${API_URL}/api/checkEmail?email=${encodeURIComponent(email)}`)
  
  if (!response.ok) {
    return true // If error, assume email is used to be safe
  }
  
  const data = await response.json()
  return data.isUsed || false
}

export async function submitReservation(data: RegistrationData): Promise<ApiResponse> {
  const response = await fetch(`${API_URL}/api/reserve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to submit reservation')
  }
  
  return response.json()
}

