import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'node:async_hooks';

// ─────────────────────────────────────────────────────────────────────────────
// Tenant Context Storage
// ─────────────────────────────────────────────────────────────────────────────

export interface TenantContext {
  collegeId: string | null;
  userId: string;
  role: string;
}

export const tenantStorage = new AsyncLocalStorage<TenantContext>();

// ─────────────────────────────────────────────────────────────────────────────
// Global models — no tenant scoping applied
// ─────────────────────────────────────────────────────────────────────────────

const GLOBAL_MODELS = new Set([
  'college',
  'role',
  'permission',
  'platformsettings',
  'auditlog',
]);

// ─────────────────────────────────────────────────────────────────────────────
// Raw Prisma client — Super Admin only, no tenant injection
// ─────────────────────────────────────────────────────────────────────────────

export const prismaAdmin = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'warn', 'error']
      : ['error'],
});

// ─────────────────────────────────────────────────────────────────────────────
// Tenant-aware Prisma client
// Auto-injects collegeId from AsyncLocalStorage into every query.
// ─────────────────────────────────────────────────────────────────────────────

export const prisma = prismaAdmin.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const store = tenantStorage.getStore();

        // Skip: no context set (unauthenticated / system call)
        if (!store) {
          return query(args);
        }

        // Skip: Super Admin bypasses all tenant isolation
        if (store.role === 'SUPER_ADMIN') {
          return query(args);
        }

        // Skip: global platform-level models
        if (GLOBAL_MODELS.has(model.toLowerCase())) {
          return query(args);
        }

        const { collegeId } = store;

        // Inject into read / update / delete — via args.where
        if (
          operation === 'findMany' ||
          operation === 'findFirst' ||
          operation === 'findFirstOrThrow' ||
          operation === 'findUnique' ||
          operation === 'findUniqueOrThrow' ||
          operation === 'update' ||
          operation === 'updateMany' ||
          operation === 'delete' ||
          operation === 'deleteMany' ||
          operation === 'count' ||
          operation === 'aggregate'
        ) {
          args = {
            ...args,
            where: {
              ...(args as any).where,
              collegeId,
            },
          };
        }

        // Inject into create — via args.data
        if (operation === 'create') {
          args = {
            ...args,
            data: {
              ...(args as any).data,
              collegeId,
            },
          };
        }

        // Inject into createMany — via args.data (array)
        if (operation === 'createMany') {
          const data = (args as any).data;
          args = {
            ...args,
            data: Array.isArray(data)
              ? data.map((row: any) => ({ ...row, collegeId }))
              : { ...data, collegeId },
          };
        }

        return query(args);
      },
    },
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Slow query detection (development only)
// ─────────────────────────────────────────────────────────────────────────────

if (process.env.NODE_ENV === 'development') {
  // @ts-expect-error — Prisma query event requires 'query' in log config (already set above)
  prismaAdmin.$on('query', (e: any) => {
    if (e.duration > 1000) {
      console.warn(`\n🐢 SLOW QUERY (${e.duration}ms):\n${e.query}\nParams: ${e.params}\n`);
    }
  });
}
