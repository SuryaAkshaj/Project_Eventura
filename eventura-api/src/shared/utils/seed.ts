import { PrismaClient, RoleName } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { prismaAdmin } from '@config/database';
import { logger } from './logger';

// ─────────────────────────────────────────────────────────────────────────────
// Role → Permission mapping (matches seed.ts exactly)
// ─────────────────────────────────────────────────────────────────────────────
const ROLES: { name: RoleName; permissions: string[] }[] = [
  {
    name: 'SUPER_ADMIN',
    permissions: [
      'admin:platform', 'admin:approve',
      'events:read', 'events:write', 'events:delete', 'events:publish',
      'scanner:use', 'scanner:history',
      'finance:read', 'finance:manage',
      'members:read', 'members:manage',
    ],
  },
  {
    name: 'COLLEGE_ADMIN',
    permissions: [
      'events:read', 'events:write', 'events:delete', 'events:publish',
      'scanner:history',
      'finance:read', 'finance:manage',
      'members:read', 'members:manage',
      'admin:approve',
    ],
  },
  {
    name: 'CLUB_PRESIDENT',
    permissions: [
      'events:read', 'events:write', 'events:publish',
      'scanner:use', 'scanner:history',
      'finance:read',
      'members:read', 'members:manage',
    ],
  },
  {
    name: 'EVENT_MANAGER',
    permissions: [
      'events:read',
      'scanner:use', 'scanner:history',
    ],
  },
  {
    name: 'ATTENDEE',
    permissions: [
      'events:read',
    ],
  },
];

export async function runProductionSeed() {
  logger.info('🌱 Running Eventura Production Auto-Seed...');

  try {
    for (const roleData of ROLES) {
      const role = await prismaAdmin.role.upsert({
        where: { name: roleData.name },
        update: {},
        create: { name: roleData.name },
      });

      for (const action of roleData.permissions) {
        const existing = await prismaAdmin.permission.findFirst({
          where: { action, roleId: role.id },
        });

        if (!existing) {
          await prismaAdmin.permission.create({
            data: { action, roleId: role.id },
          });
        }
      }
    }

    await prismaAdmin.platformSettings.upsert({
      where: { id: 'singleton' },
      update: {},
      create: {
        id: 'singleton',
        platformFeeEnabled: false,
        platformFeePercent: 2.5,
        maintenanceMode: false,
      },
    });

    const superAdminRole = await prismaAdmin.role.findUnique({
      where: { name: 'SUPER_ADMIN' },
    });

    if (!superAdminRole) {
      throw new Error('SUPER_ADMIN role not found — roles seed must have failed');
    }

    let college = await prismaAdmin.college.findFirst({
      where: { approvalStatus: 'APPROVED' },
    });

    if (!college) {
      college = await prismaAdmin.college.upsert({
        where: { domain: 'eventura.app' },
        update: {},
        create: {
          name: 'Eventura Platform',
          domain: 'eventura.app',
          city: 'Hyderabad',
          state: 'Telangana',
          type: 'Private',
          slug: 'eventura-platform',
          approvalStatus: 'APPROVED',
          approvedAt: new Date(),
          isSeeded: true,
        },
      });
    }

    const passwordHash = await bcrypt.hash('Admin@1234', 12);

    const adminUser = await prismaAdmin.user.upsert({
      where: { email: 'admin@eventura.app' },
      update: {},
      create: {
        email: 'admin@eventura.app',
        passwordHash,
        firstName: 'Super',
        lastName: 'Admin',
        isEmailVerified: true,
        accountMode: 'COLLEGE',
      },
    });

    const existingAssignment = await prismaAdmin.roleAssignment.findFirst({
      where: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
        collegeId: college.id,
      },
    });

    if (!existingAssignment) {
      await prismaAdmin.roleAssignment.create({
        data: {
          userId: adminUser.id,
          roleId: superAdminRole.id,
          collegeId: college.id,
          clubId: null,
          status: 'APPROVED',
        },
      });
    } else {
      await prismaAdmin.roleAssignment.update({
        where: { id: existingAssignment.id },
        data: { status: 'APPROVED' },
      });
    }

    logger.info('✅ Production auto-seed complete!');
  } catch (err) {
    logger.error('❌ Production auto-seed failed:', err);
  }
}
