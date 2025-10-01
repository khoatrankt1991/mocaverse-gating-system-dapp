import { Hono } from 'hono';
import type { Env } from '../types';
import { generateInviteCode } from '../services/inviteCodeService';

const app = new Hono<{ Bindings: Env }>();

/**
 * Middleware to check admin API key
 */
app.use('*', async (c, next) => {
  const apiKey = c.req.header('X-API-Key');
  
  if (!apiKey || apiKey !== c.env.ADMIN_API_KEY) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  await next();
});

/**
 * POST /api/admin/generate-code
 * Generate a new invite code (admin only)
 */
app.post('/generate-code', async (c) => {
  try {
    const body = await c.req.json<{ 
      referrerEmail?: string; 
      maxUses?: number;
    }>();
    
    const inviteCode = await generateInviteCode(
      c.env,
      body.referrerEmail,
      body.maxUses || 1
    );
    
    return c.json({
      success: true,
      code: inviteCode.code,
      maxUses: inviteCode.max_uses,
      referrerEmail: inviteCode.referrer_email
    }, 201);
  } catch (error) {
    console.error('Error generating invite code:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * GET /api/admin/stats
 * Get system statistics (admin only)
 */
app.get('/stats', async (c) => {
  try {
    const totalCodes = await c.env.DB
      .prepare('SELECT COUNT(*) as count FROM invite_codes')
      .first<{ count: number }>();
    
    const activeCodes = await c.env.DB
      .prepare('SELECT COUNT(*) as count FROM invite_codes WHERE is_active = 1 AND current_uses < max_uses')
      .first<{ count: number }>();
    
    const totalRegistrations = await c.env.DB
      .prepare('SELECT COUNT(*) as count FROM registrations')
      .first<{ count: number }>();
    
    const nftRegistrations = await c.env.DB
      .prepare('SELECT COUNT(*) as count FROM registrations WHERE registration_type = ?')
      .bind('nft')
      .first<{ count: number }>();
    
    const inviteRegistrations = await c.env.DB
      .prepare('SELECT COUNT(*) as count FROM registrations WHERE registration_type = ?')
      .bind('invite')
      .first<{ count: number }>();
    
    return c.json({
      inviteCodes: {
        total: totalCodes?.count || 0,
        active: activeCodes?.count || 0
      },
      registrations: {
        total: totalRegistrations?.count || 0,
        nft: nftRegistrations?.count || 0,
        invite: inviteRegistrations?.count || 0
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;

