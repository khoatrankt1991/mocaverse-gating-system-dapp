import { Hono } from 'hono';
import type { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

/**
 * GET /api/vip-status
 * Check if wallet address is registered as VIP
 */
app.get('/', async (c) => {
  try {
    const wallet = c.req.query('wallet');
    
    if (!wallet) {
      return c.json({ error: 'Wallet address is required' }, 400);
    }

    // Check if wallet is registered
    const registration = await c.env.DB
      .prepare(`
        SELECT 
          r.email,
          r.registration_type,
          r.registered_at,
          ic.code as invite_code
        FROM registrations r
        LEFT JOIN invite_codes ic ON r.invite_code_id = ic.id
        WHERE r.wallet_address = ?
        ORDER BY r.registered_at DESC
        LIMIT 1
      `)
      .bind(wallet.toLowerCase())
      .first<{
        email: string;
        registration_type: string;
        registered_at: number;
        invite_code: string | null;
      }>();

    if (!registration) {
      return c.json({
        isVip: false,
        message: 'Wallet not registered'
      });
    }

    return c.json({
      isVip: true,
      registration: {
        email: registration.email,
        type: registration.registration_type,
        registeredAt: new Date(registration.registered_at * 1000).toISOString(),
        inviteCode: registration.invite_code
      }
    });

  } catch (error) {
    console.error('Error checking VIP status:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;
