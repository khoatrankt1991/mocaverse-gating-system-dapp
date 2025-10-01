import type { Env, InviteCode } from '../types';
import { generateUniqueCode } from '../utils/codeGenerator';

/**
 * Generate a new invite code
 */
export async function generateInviteCode(
  env: Env,
  referrerEmail?: string,
  maxUses: number = 1
): Promise<InviteCode> {
  const code = await generateUniqueCode(env.DB);
  const now = Date.now();
  
  const result = await env.DB
    .prepare(
      'INSERT INTO invite_codes (code, referrer_email, max_uses, current_uses, created_at, is_active) VALUES (?, ?, ?, 0, ?, 1)'
    )
    .bind(code, referrerEmail || null, maxUses, now)
    .run();
  
  return {
    id: result.meta.last_row_id!,
    code,
    referrer_email: referrerEmail || null,
    max_uses: maxUses,
    current_uses: 0,
    created_at: now,
    is_active: 1
  };
}

/**
 * Verify if an invite code is valid and has uses left
 */
export async function verifyInviteCode(
  code: string,
  env: Env
): Promise<{ valid: boolean; message?: string; usesLeft?: number; codeId?: number }> {
  const inviteCode = await env.DB
    .prepare('SELECT * FROM invite_codes WHERE code = ?')
    .bind(code)
    .first<InviteCode>();
  
  if (!inviteCode) {
    return { valid: false, message: 'Invite code not found' };
  }
  
  if (!inviteCode.is_active) {
    return { valid: false, message: 'Invite code is no longer active' };
  }
  
  const usesLeft = inviteCode.max_uses - inviteCode.current_uses;
  
  if (usesLeft <= 0) {
    return { valid: false, message: 'Invite code has no uses left' };
  }
  
  return {
    valid: true,
    usesLeft,
    codeId: inviteCode.id
  };
}

/**
 * Increment the usage count of an invite code
 */
export async function incrementCodeUsage(
  codeId: number,
  env: Env
): Promise<void> {
  await env.DB
    .prepare('UPDATE invite_codes SET current_uses = current_uses + 1 WHERE id = ?')
    .bind(codeId)
    .run();
}

