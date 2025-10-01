import { z } from 'zod';

// Email validation schema
export const emailSchema = z.string().email().toLowerCase();

// Ethereum address validation
export const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

// Invite code validation (MOCA-XXXXXXXX format)
export const inviteCodeSchema = z.string().regex(/^MOCA-[A-Z2-9]{8}$/, 'Invalid invite code format');

// Reserve request validation
export const reserveRequestSchema = z.object({
  email: emailSchema,
  wallet: addressSchema.optional(),
  inviteCode: inviteCodeSchema.optional(),
  signature: z.string().optional(),
  registrationType: z.enum(['nft', 'invite'])
});

// Helper functions
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidInviteCode(code: string): boolean {
  return /^MOCA-[A-Z2-9]{8}$/.test(code);
}

