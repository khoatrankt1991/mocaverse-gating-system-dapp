import type { Env, Registration } from '../types';
import { normalizeEmail } from '../utils/validation';

/**
 * Check if email is already registered
 */
export async function isEmailUsed(email: string, env: Env): Promise<boolean> {
  const normalizedEmail = normalizeEmail(email);
  
  const result = await env.DB
    .prepare('SELECT id FROM registrations WHERE email = ?')
    .bind(normalizedEmail)
    .first();
  
  return result !== null;
}

/**
 * Check if wallet address is already registered
 */
export async function isWalletUsed(walletAddress: string, env: Env): Promise<boolean> {
  const result = await env.DB
    .prepare('SELECT id FROM registrations WHERE wallet_address = ?')
    .bind(walletAddress.toLowerCase())
    .first();
  
  return result !== null;
}

/**
 * Create a new registration
 */
export async function createRegistration(
  email: string,
  walletAddress: string | null,
  inviteCodeId: number | null,
  registrationType: 'nft' | 'invite',
  env: Env
): Promise<Registration> {
  const normalizedEmail = normalizeEmail(email);
  const normalizedWallet = walletAddress ? walletAddress.toLowerCase() : null;
  const now = Date.now();
  
  const result = await env.DB
    .prepare(
      'INSERT INTO registrations (email, wallet_address, invite_code_id, registration_type, registered_at) VALUES (?, ?, ?, ?, ?)'
    )
    .bind(normalizedEmail, normalizedWallet, inviteCodeId, registrationType, now)
    .run();
  
  return {
    id: result.meta.last_row_id!,
    email: normalizedEmail,
    wallet_address: normalizedWallet,
    invite_code_id: inviteCodeId,
    registration_type: registrationType,
    registered_at: now
  };
}

