/// <reference types="node" />
/**
 * seed-test-accounts.ts
 *
 * Creates clean test accounts for manual testing.
 * Safe to run multiple times — uses upsert, never duplicates.
 *
 * Accounts created:
 *   Super Admin    admin@eventura.app       Admin@1234
 *   College Admin  collegeadmin@woxsen.edu.in  Test@1234
 *   Club President clubpresident@woxsen.edu.in Test@1234
 *   Attendee       test@woxsen.edu.in       Test@1234
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🌱 Seeding test accounts...\n');

  // ── 1. Ensure roles exist ──────────────────────────────────────────────────
  const roleNames = ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'CLUB_PRESIDENT', 'ATTENDEE'] as const;
  const roleMap: Record<string, string> = {};

  for (const name of roleNames) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    roleMap[name] = role.id;
  }
  console.log('✅ Roles ready');

  // ── 2. Ensure Woxsen college exists and is APPROVED ───────────────────────
  const college = await prisma.college.upsert({
    where: { domain: 'woxsen.edu.in' },
    update: { approvalStatus: 'APPROVED' },
    create: {
      name: 'Woxsen University',
      domain: 'woxsen.edu.in',
      approvalStatus: 'APPROVED',
      approvedAt: new Date(),
    },
  });
  console.log(`✅ College ready: ${college.name} (${college.id})`);

  // ── 3. Ensure TechSoc club exists and is APPROVED ─────────────────────────
  let club = await prisma.club.findFirst({
    where: { name: 'TechSoc', collegeId: college.id },
  });
  if (!club) {
    club = await prisma.club.create({
      data: {
        name: 'TechSoc',
        description: 'Technology and Innovation Club',
        collegeId: college.id,
        approvalStatus: 'APPROVED',
        approvedAt: new Date(),
      },
    });
  } else {
    club = await prisma.club.update({
      where: { id: club.id },
      data: { approvalStatus: 'APPROVED' },
    });
  }
  console.log(`✅ Club ready: ${club.name} (${club.id})`);

  const password = await bcrypt.hash('Test@1234', 12);
  const adminPassword = await bcrypt.hash('Admin@1234', 12);

  // ── 4. Helper: upsert user + role assignment ───────────────────────────────
  async function upsertUser(opts: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    roleName: string;
    collegeId: string;
    clubId?: string | null;
  }) {
    const user = await prisma.user.upsert({
      where: { email: opts.email },
      update: {
        // On re-seed: ensure email is verified and account is active
        isEmailVerified: true,
        isActive: true,
      },
      create: {
        email: opts.email,
        passwordHash: opts.password,
        firstName: opts.firstName,
        lastName: opts.lastName,
        isEmailVerified: true,
        isActive: true,
      },
    });

    // Ensure role assignment is APPROVED
    const existing = await prisma.roleAssignment.findFirst({
      where: {
        userId: user.id,
        roleId: roleMap[opts.roleName],
        collegeId: opts.collegeId,
      },
    });

    if (existing) {
      await prisma.roleAssignment.update({
        where: { id: existing.id },
        data: { status: 'APPROVED', clubId: opts.clubId ?? null },
      });
    } else {
      await prisma.roleAssignment.create({
        data: {
          userId: user.id,
          roleId: roleMap[opts.roleName],
          collegeId: opts.collegeId,
          clubId: opts.clubId ?? null,
          status: 'APPROVED',
        },
      });
    }

    return user;
  }

  // ── 5. Super Admin (admin@eventura.app) ───────────────────────────────────
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@eventura.app' },
    update: { isEmailVerified: true, isActive: true },
    create: {
      email: 'admin@eventura.app',
      passwordHash: adminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      isEmailVerified: true,
      isActive: true,
    },
  });

  const existingSA = await prisma.roleAssignment.findFirst({
    where: { userId: superAdmin.id, roleId: roleMap['SUPER_ADMIN'] },
  });
  if (existingSA) {
    await prisma.roleAssignment.update({
      where: { id: existingSA.id },
      data: { status: 'APPROVED' },
    });
  } else {
    await prisma.roleAssignment.create({
      data: {
        userId: superAdmin.id,
        roleId: roleMap['SUPER_ADMIN'],
        collegeId: college.id,
        clubId: null,
        status: 'APPROVED',
      },
    });
  }
  console.log('✅ Super Admin ready');

  // ── 6. College Admin ──────────────────────────────────────────────────────
  await upsertUser({
    email: 'collegeadmin@woxsen.edu.in',
    firstName: 'Arjun',
    lastName: 'Mehta',
    password,
    roleName: 'COLLEGE_ADMIN',
    collegeId: college.id,
    clubId: null,
  });
  console.log('✅ College Admin ready');

  // ── 7. Club President ─────────────────────────────────────────────────────
  await upsertUser({
    email: 'clubpresident@woxsen.edu.in',
    firstName: 'Priya',
    lastName: 'Sharma',
    password,
    roleName: 'CLUB_PRESIDENT',
    collegeId: college.id,
    clubId: club.id,
  });
  console.log('✅ Club President ready');

  // ── 8. Attendee (mission test account) ───────────────────────────────────
  await upsertUser({
    email: 'test@woxsen.edu.in',
    firstName: 'Rahul',
    lastName: 'Gupta',
    password,
    roleName: 'ATTENDEE',
    collegeId: college.id,
    clubId: null,
  });
  console.log('✅ Attendee ready');

  // ── 9. Platform settings ──────────────────────────────────────────────────
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

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n🎉 Test accounts ready!\n');
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│                    TEST CREDENTIALS                         │');
  console.log('├──────────────────┬────────────────────────────┬────────────┤');
  console.log('│ Role             │ Email                      │ Password   │');
  console.log('├──────────────────┼────────────────────────────┼────────────┤');
  console.log('│ Super Admin      │ admin@eventura.app         │ Admin@1234 │');
  console.log('│ College Admin    │ collegeadmin@woxsen.edu.in │ Test@1234  │');
  console.log('│ Club President   │ clubpresident@woxsen.edu.in│ Test@1234  │');
  console.log('│ Attendee         │ test@woxsen.edu.in         │ Test@1234  │');
  console.log('└──────────────────┴────────────────────────────┴────────────┘');
  console.log(`\nWoxsen College ID: ${college.id}`);
  console.log(`TechSoc Club ID:   ${club.id}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
