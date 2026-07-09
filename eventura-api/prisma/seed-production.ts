import { PrismaClient, RoleName } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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

// ─────────────────────────────────────────────────────────────────────────────
// Production Seed — idempotent (safe to run multiple times)
// ─────────────────────────────────────────────────────────────────────────────
async function seedProduction() {
  console.log('\n🌱 Eventura Production Seed\n');
  console.log('='.repeat(40));

  // ── Step 1: Seed Roles + Permissions ──────────────────────────────────────
  console.log('\n📋 Seeding roles...');

  for (const roleData of ROLES) {
    // Upsert role (create if missing, no-op if exists)
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: { name: roleData.name },
    });

    // Upsert each permission for this role
    // Permission has @@unique([action, roleId]) so we check existence first
    for (const action of roleData.permissions) {
      const existing = await prisma.permission.findFirst({
        where: { action, roleId: role.id },
      });

      if (!existing) {
        await prisma.permission.create({
          data: { action, roleId: role.id },
        });
      }
    }

    console.log(`  ✅ Role: ${roleData.name} (${roleData.permissions.length} permissions)`);
  }

  // ── Step 2: Platform Settings Singleton ───────────────────────────────────
  console.log('\n⚙️  Seeding platform settings...');

  await prisma.platformSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      platformFeeEnabled: false,
      platformFeePercent: 2.5,
      maintenanceMode: false,
    },
  });

  console.log('  ✅ Platform settings singleton');

  // ── Step 3: Super Admin User ──────────────────────────────────────────────
  console.log('\n👤 Seeding Super Admin...');

  const superAdminRole = await prisma.role.findUnique({
    where: { name: 'SUPER_ADMIN' },
  });

  if (!superAdminRole) {
    throw new Error('SUPER_ADMIN role not found — roles seed must have failed');
  }

  // Find any approved college to attach the super admin role assignment to
  let college = await prisma.college.findFirst({
    where: { approvalStatus: 'APPROVED' },
  });

  // If no approved college exists, create a system college
  if (!college) {
    console.log('  ⚠️  No approved college found — creating system college');
    college = await prisma.college.upsert({
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
    console.log('  ✅ System college created: eventura.app');
  }

  // Create super admin user
  const passwordHash = await bcrypt.hash('Admin@1234', 12);

  const adminUser = await prisma.user.upsert({
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

  // Create role assignment for super admin
  // Use findFirst + create pattern (avoids null composite key issue with clubId)
  const existingAssignment = await prisma.roleAssignment.findFirst({
    where: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
      collegeId: college.id,
    },
  });

  if (!existingAssignment) {
    await prisma.roleAssignment.create({
      data: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
        collegeId: college.id,
        clubId: null,
        status: 'APPROVED',
      },
    });
  } else {
    await prisma.roleAssignment.update({
      where: { id: existingAssignment.id },
      data: { status: 'APPROVED' },
    });
  }

  console.log('  ✅ Super Admin created/verified: admin@eventura.app / Admin@1234');

  // ── Summary ───────────────────────────────────────────────────────────────
  const roleCount = await prisma.role.count();
  const permCount = await prisma.permission.count();
  const userCount = await prisma.user.count();
  const collegeCount = await prisma.college.count();

  console.log('\n' + '='.repeat(40));
  console.log('✅ Production seed complete!\n');
  console.log(`   Roles:       ${roleCount}`);
  console.log(`   Permissions: ${permCount}`);
  console.log(`   Users:       ${userCount}`);
  console.log(`   Colleges:    ${collegeCount}`);
  console.log('\n📝 Super Admin credentials:');
  console.log('   Email:    admin@eventura.app');
  console.log('   Password: Admin@1234');
  console.log('\n⚠️  IMPORTANT: Change the Super Admin password after first login!\n');

  await prisma.$disconnect();
}

seedProduction().catch((err) => {
  console.error('❌ Seed failed:', err);
  throw err;
});
