import { Hono } from 'hono';
import type { Env, ReserveRequest } from '../types';
import { verifyInviteCode, incrementCodeUsage } from '../services/inviteCodeService';
import { checkNFTEligibilityWithCache } from '../services/nftService';
import { isEmailUsed, isWalletUsed, createRegistration } from '../services/emailService';
import { checkRateLimit, incrementRateLimit } from '../services/rateLimitService';
import { reserveRequestSchema } from '../utils/validation';
import { verifyWalletSignature } from '../utils/blockchain';

const app = new Hono<{ Bindings: Env }>();

/**
 * POST /api/reserve
 * Reserve a spot using either NFT or invite code
 */
app.post('/', async (c) => {
  try {
    // Parse and validate request body
    const body = await c.req.json<ReserveRequest>();
    const validation = reserveRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return c.json({ 
        error: 'Validation failed', 
        message: validation.error.message 
      }, 400);
    }
    
    const { email, wallet, inviteCode, signature, registrationType } = validation.data;
    
    // Check rate limit
    const rateLimit = await checkRateLimit(email, c.env);
    if (rateLimit.limited) {
      return c.json({ 
        error: 'Rate limit exceeded', 
        message: 'Too many requests. Please try again later.' 
      }, 429);
    }
    
    // Check if email already used
    if (await isEmailUsed(email, c.env)) {
      return c.json({ 
        error: 'Email already registered', 
        message: 'This email has already been used' 
      }, 400);
    }
    
    // Check if wallet already used (for NFT registration)
    if (wallet && await isWalletUsed(wallet, c.env)) {
      return c.json({ 
        error: 'Wallet already registered', 
        message: 'This wallet has already been used' 
      }, 400);
    }
    
    let inviteCodeId: number | null = null;
    
    // Verify based on registration type
    if (registrationType === 'nft') {
      // NFT verification flow - Backend must verify eligibility
      if (!wallet) {
        return c.json({ 
          error: 'Missing required fields', 
          message: 'Wallet address is required for NFT registration' 
        }, 400);
      }
      
      // Check NFT eligibility on-chain
      const hasEligibleNFT = await checkNFTEligibilityWithCache(wallet, c.env);
      
      if (!hasEligibleNFT) {
        return c.json({ 
          error: 'Not eligible', 
          message: 'No eligible NFT found. NFT must be staked for at least 7 days.' 
        }, 403);
      }
      
    } else if (registrationType === 'invite') {
      // Invite code verification flow
      if (!inviteCode) {
        return c.json({ 
          error: 'Missing invite code', 
          message: 'Invite code is required for invite registration' 
        }, 400);
      }
      
      const codeVerification = await verifyInviteCode(inviteCode, c.env);
      
      if (!codeVerification.valid) {
        return c.json({ 
          error: 'Invalid invite code', 
          message: codeVerification.message 
        }, 400);
      }
      
      inviteCodeId = codeVerification.codeId!;
    }
    
    // Create registration
    const registration = await createRegistration(
      email,
      wallet || null,
      inviteCodeId,
      registrationType,
      c.env
    );
    
    // Increment invite code usage if applicable
    if (inviteCodeId) {
      await incrementCodeUsage(inviteCodeId, c.env);
    }
    
    // Increment rate limit
    await incrementRateLimit(email, c.env);
    
    return c.json({
      success: true,
      message: 'Registration successful',
      registration: {
        email: registration.email,
        type: registration.registration_type,
        registeredAt: registration.registered_at
      }
    }, 201);
    
  } catch (error) {
    console.error('Error during reservation:', error);
    return c.json({ 
      error: 'Internal server error', 
      message: 'An error occurred while processing your request' 
    }, 500);
  }
});

export default app;

