import { Hono } from 'hono';
import type { Env } from '../types';
import { isEmailUsed } from '../services/emailService';
import { emailSchema } from '../utils/validation';

const app = new Hono<{ Bindings: Env }>();

/**
 * GET /api/check-email?email=user@example.com
 * Check if an email is already registered
 */
app.get('/', async (c) => {
  const email = c.req.query('email');
  
  if (!email) {
    return c.json({ error: 'Missing email parameter' }, 400);
  }
  
  // Validate email format
  const validation = emailSchema.safeParse(email);
  if (!validation.success) {
    return c.json({ error: 'Invalid email format' }, 400);
  }
  
  try {
    const used = await isEmailUsed(validation.data, c.env);
    return c.json({ used });
  } catch (error) {
    console.error('Error checking email:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;

