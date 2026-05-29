import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdmin() {
  // Get or create SUPER_ADMIN role
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      permissions: {
        create: [
          { action: 'admin:platform' },
          { action: 'admin:approve' },
          { action: 'events:read' },
          { action: 'events:write' },
          { action: 'finance:read' },
          { action: 'finance:manage' },
        ]
      }
    }
  });

  // Create Super Admin user
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
    }
  });

  // We need a college for the role assignment (use first approved college)
  const college = await prisma.college.findFirst({
    where: { approvalStatus: 'APPROVED' }
  });

  if (!college) {
    console.log('❌ No approved college found — run main seed first');
    return;
  }

  // Create role assignment using findFirst + create pattern (avoids null composite key issue)
  const existingAssignment = await prisma.roleAssignment.findFirst({
    where: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
      collegeId: college.id,
    }
  });

  if (!existingAssignment) {
    await prisma.roleAssignment.create({
      data: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
        collegeId: college.id,
        clubId: null,
        status: 'APPROVED',
      }
    });
  } else {
    await prisma.roleAssignment.update({
      where: { id: existingAssignment.id },
      data: { status: 'APPROVED' }
    });
  }

  // Create platform settings if not exists
  await prisma.platformSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      platformFeeEnabled: false,
      platformFeePercent: 2.5,
      maintenanceMode: false,
    }
  });

  console.log('✅ Super Admin created:');
  console.log('   Email: admin@eventura.app');
  console.log('   Password: Admin@1234');
  await prisma.$disconnect();
}

seedAdmin().catch(console.error);
