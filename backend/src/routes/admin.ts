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
 * GET /api/admin/invite-codes
 * Get list of all invite codes (admin only)
 */
app.get('/invite-codes', async (c) => {
  try {
    const query = c.req.query();
    const limit = parseInt(query.limit) || 50;
    const offset = parseInt(query.offset) || 0;
    const status = query.status; // 'active', 'inactive', 'all'
    
    let whereClause = '';
    let params: any[] = [];
    
    if (status === 'active') {
      whereClause = 'WHERE is_active = 1 AND current_uses < max_uses';
    } else if (status === 'inactive') {
      whereClause = 'WHERE is_active = 0 OR current_uses >= max_uses';
    }
    
    const inviteCodes = await c.env.DB
      .prepare(`
        SELECT 
          code,
          referrer_email,
          max_uses,
          current_uses,
          is_active,
          created_at,
          CASE 
            WHEN is_active = 0 THEN 'inactive'
            WHEN current_uses >= max_uses THEN 'exhausted'
            ELSE 'active'
          END as status
        FROM invite_codes 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `)
      .bind(limit, offset)
      .all<{
        code: string;
        referrer_email: string | null;
        max_uses: number;
        current_uses: number;
        is_active: number;
        created_at: string;
        status: string;
      }>();
    
    const totalCount = await c.env.DB
      .prepare(`SELECT COUNT(*) as count FROM invite_codes ${whereClause}`)
      .first<{ count: number }>();
    
    return c.json({
      success: true,
      data: inviteCodes.results,
      pagination: {
        total: totalCount?.count || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (totalCount?.count || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching invite codes:', error);
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

