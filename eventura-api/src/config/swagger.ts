import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Eventura API',
      version: '1.0.0',
      description: 'Enterprise event management platform API for colleges, companies, and communities across India.',
      contact: {
        name: 'Eventura Support',
        email: 'support@eventura.app',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000/api/v1',
        description: 'Local development',
      },
      {
        url: 'https://api.eventura.app/api/v1',
        description: 'Production',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token from POST /auth/login',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'NOT_FOUND' },
                message: { type: 'string', example: 'Resource not found' },
              },
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication and session management' },
      { name: 'Events', description: 'Event discovery and management' },
      { name: 'Registrations', description: 'Event registration and tickets' },
      { name: 'QR', description: 'QR code generation and check-in' },
      { name: 'Payments', description: 'Razorpay payment integration' },
      { name: 'Certificates', description: 'Attendance certificate generation' },
      { name: 'Colleges', description: 'Organisation and team management' },
      { name: 'Bookmarks', description: 'Event bookmarking' },
      { name: 'Admin', description: 'Super Admin platform management' },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
