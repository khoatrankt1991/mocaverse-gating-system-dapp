import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { swaggerUI } from '@hono/swagger-ui';
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

// Swagger UI
app.get('/docs', swaggerUI({ 
  url: '/api-docs',
  title: 'Moca Gating System API',
}));

// OpenAPI JSON
app.get('/api-docs', (c) => {
  return c.json({
    openapi: '3.0.0',
    info: {
      title: 'Moca Gating System API',
      version: '1.0.0',
      description: 'API for NFT-based access control with invite codes'
    },
    servers: [
      {
        url: 'http://localhost:8787',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'Admin API key for protected endpoints'
        }
      }
    },
    paths: {
      '/api/verify-code': {
        get: {
          summary: 'Verify invite code',
          parameters: [
            {
              name: 'code',
              in: 'query',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'Code verification result',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      valid: { type: 'boolean' },
                      message: { type: 'string' },
                      usesLeft: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/check-email': {
        get: {
          summary: 'Check if email is already used',
          parameters: [
            {
              name: 'email',
              in: 'query',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'Email usage status',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      used: { type: 'boolean' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/check-wallet': {
        get: {
          summary: 'Check NFT eligibility for wallet',
          parameters: [
            {
              name: 'wallet',
              in: 'query',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'NFT eligibility status',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      eligible: { type: 'boolean' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/reserve': {
        post: {
          summary: 'Submit registration',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string' },
                    wallet: { type: 'string' },
                    inviteCode: { type: 'string' },
                    signature: { type: 'string' },
                    registrationType: { 
                      type: 'string',
                      enum: ['nft', 'invite']
                    }
                  },
                  required: ['email', 'registrationType']
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Registration successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/admin/generate-code': {
        post: {
          summary: 'Generate new invite code (Admin only)',
          security: [{ apiKey: [] }],
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    referrerEmail: { 
                      type: 'string',
                      description: 'Email of the referrer (optional)'
                    },
                    maxUses: { 
                      type: 'number',
                      description: 'Maximum number of uses (default: 1)',
                      minimum: 1
                    }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Invite code generated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      code: { type: 'string' },
                      maxUses: { type: 'number' },
                      referrerEmail: { type: 'string' }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - Invalid API key'
            }
          }
        }
      },
      '/api/admin/invite-codes': {
        get: {
          summary: 'Get list of invite codes (Admin only)',
          security: [{ apiKey: [] }],
          parameters: [
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'number', minimum: 1, maximum: 100, default: 50 },
              description: 'Number of codes to return'
            },
            {
              name: 'offset',
              in: 'query',
              schema: { type: 'number', minimum: 0, default: 0 },
              description: 'Number of codes to skip'
            },
            {
              name: 'status',
              in: 'query',
              schema: { 
                type: 'string',
                enum: ['active', 'inactive', 'all'],
                default: 'all'
              },
              description: 'Filter by status: active, inactive, or all'
            }
          ],
          responses: {
            '200': {
              description: 'List of invite codes',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            code: { type: 'string' },
                            referrer_email: { type: 'string', nullable: true },
                            max_uses: { type: 'number' },
                            current_uses: { type: 'number' },
                            is_active: { type: 'number' },
                            created_at: { type: 'string' },
                            status: { 
                              type: 'string',
                              enum: ['active', 'inactive', 'exhausted']
                            }
                          }
                        }
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          total: { type: 'number' },
                          limit: { type: 'number' },
                          offset: { type: 'number' },
                          hasMore: { type: 'boolean' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - Invalid API key'
            }
          }
        }
      },
      '/api/admin/stats': {
        get: {
          summary: 'Get system statistics (Admin only)',
          security: [{ apiKey: [] }],
          responses: {
            '200': {
              description: 'System statistics',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      inviteCodes: {
                        type: 'object',
                        properties: {
                          total: { type: 'number' },
                          active: { type: 'number' }
                        }
                      },
                      registrations: {
                        type: 'object',
                        properties: {
                          total: { type: 'number' },
                          nft: { type: 'number' },
                          invite: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - Invalid API key'
            }
          }
        }
      }
    }
  });
});

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    service: 'Moca Gating System API',
    version: '1.0.0',
    status: 'healthy',
    docs: '/docs',
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

