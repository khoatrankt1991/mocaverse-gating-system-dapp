// Cloudflare Worker Environment bindings
export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  SEPOLIA_RPC_URL: string;
  NFT_CONTRACT_ADDRESS: string;
  ADMIN_API_KEY?: string;
}

// Database Models
export interface InviteCode {
  id: number;
  code: string;
  referrer_email: string | null;
  max_uses: number;
  current_uses: number;
  created_at: number;
  is_active: number;
}

export interface Registration {
  id: number;
  email: string;
  wallet_address: string | null;
  invite_code_id: number | null;
  registration_type: 'nft' | 'invite';
  registered_at: number;
}

// API Request/Response Types
export interface VerifyCodeResponse {
  valid: boolean;
  message?: string;
  usesLeft?: number;
}

export interface ReserveRequest {
  email: string;
  walletAddress?: string;
  inviteCode?: string;
  signature?: string;
  registrationType: 'nft' | 'invite';
}

export interface ReserveResponse {
  success: boolean;
  message: string;
  registration?: {
    email: string;
    type: 'nft' | 'invite';
    registeredAt: number;
  };
}

export interface ErrorResponse {
  error: string;
  message: string;
}

