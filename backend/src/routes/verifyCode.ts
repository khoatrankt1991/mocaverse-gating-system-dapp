import { Hono } from 'hono';
import type { Env } from '../types';
import { verifyInviteCode } from '../services/inviteCodeService';
import { isValidInviteCode } from '../utils/validation';

const app = new Hono<{ Bindings: Env }>();

/**
 * GET /api/verify-code?code=MOCA-XXXXXXXX
 * Verify if an invite code is valid
 */
app.get('/', async (c) => {
  const code = c.req.query('code');
  
  if (!code) {
    return c.json({ error: 'Missing code parameter' }, 400);
  }
  
  if (!isValidInviteCode(code)) {
    return c.json({ valid: false, message: 'Invalid code format' }, 200);
  }
  
  try {
    const result = await verifyInviteCode(code, c.env);
    return c.json(result);
  } catch (error) {
    console.error('Error verifying code:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;

