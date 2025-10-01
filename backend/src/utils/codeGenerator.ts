/**
 * Generate invite code in format: MOCA-XXXXXXXX
 * Uses charset A-Z2-9 (excludes 0, O, I, 1, l for clarity)
 */
export function generateInviteCode(): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes confusing chars
  const length = 8;
  
  let code = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    code += charset[randomIndex];
  }
  
  return `MOCA-${code}`;
}

/**
 * Check if code is unique in database
 */
export async function generateUniqueCode(db: D1Database): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const code = generateInviteCode();
    
    // Check if code exists
    const existing = await db
      .prepare('SELECT id FROM invite_codes WHERE code = ?')
      .bind(code)
      .first();
    
    if (!existing) {
      return code;
    }
    
    attempts++;
  }
  
  throw new Error('Failed to generate unique invite code');
}

