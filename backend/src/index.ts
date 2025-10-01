import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';

// Import routes
import verifyCodeRoute from './routes/verifyCode';
import checkEmailRoute from './routes/checkEmail';
import checkWalletRoute from './routes/checkWallet';
import reserveRoute from './routes/reserve';
import adminRoute from './routes/admin';

// Create main Hono app
const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('*', cors({
  origin: '*', // In production, specify allowed origins
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'X-API-Key'],
  maxAge: 86400
}));

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    service: 'Moca Gating System API',
    version: '1.0.0',
    status: 'healthy',
    endpoints: {
      verifyCode: '/api/verify-code',
      checkEmail: '/api/check-email',
      checkWallet: '/api/check-wallet',
      reserve: '/api/reserve',
      admin: '/api/admin'
    }
  });
});

// Mount API routes
app.route('/api/verify-code', verifyCodeRoute);
app.route('/api/check-email', checkEmailRoute);
app.route('/api/check-wallet', checkWalletRoute);
app.route('/api/reserve', reserveRoute);
app.route('/api/admin', adminRoute);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({
    error: 'Internal Server Error',
    message: err.message
  }, 500);
});

export default app;

