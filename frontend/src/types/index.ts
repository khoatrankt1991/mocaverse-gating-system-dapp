export type Step = 'select' | 'verify-code' | 'verify-nft' | 'register' | 'success'

export type GatingMethod = 'nft' | 'invite'

export interface RegistrationData {
  email: string
  wallet?: string
  inviteCode?: string
  signature?: string
  registrationType: GatingMethod
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface InviteCodeResponse {
  valid: boolean
  remainingUses?: number
  message?: string
}

export interface NFTEligibilityResponse {
  eligible: boolean
  message?: string
}

