import { Hono } from 'hono';
import type { Env } from '../types';
import { isWalletUsed } from '../services/emailService';
import { addressSchema } from '../utils/validation';

const app = new Hono<{ Bindings: Env }>();

/**
 * GET /api/check-wallet?wallet=0x...
 * Check if a wallet address is already registered
 */
app.get('/', async (c) => {
  const wallet = c.req.query('wallet');
  
  if (!wallet) {
    return c.json({ error: 'Missing wallet parameter' }, 400);
  }
  
  // Validate address format
  const validation = addressSchema.safeParse(wallet);
  if (!validation.success) {
    return c.json({ error: 'Invalid wallet address format' }, 400);
  }
  
  try {
    const used = await isWalletUsed(validation.data, c.env);
    return c.json({ used });
  } catch (error) {
    console.error('Error checking wallet:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;

