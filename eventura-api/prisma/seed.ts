import { PrismaClient, RoleName, ApprovalStatus, EventStatus, EventVisibility, PaymentStatus, RegistrationStatus, ScanResult } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ── 1. Seed Roles + Permissions ────────────────────────────────────────────
  console.log('Creating roles and permissions...');

  const rolePermissions: Record<RoleName, string[]> = {
    SUPER_ADMIN: [
      'admin:platform', 'admin:approve',
      'events:read', 'events:write', 'events:delete', 'events:publish',
      'scanner:use', 'scanner:history',
      'finance:read', 'finance:manage',
      'members:read', 'members:manage',
    ],
    COLLEGE_ADMIN: [
      'events:read', 'events:write', 'events:delete', 'events:publish',
      'scanner:history',
      'finance:read', 'finance:manage',
      'members:read', 'members:manage',
      'admin:approve',
    ],
    CLUB_PRESIDENT: [
      'events:read', 'events:write', 'events:publish',
      'scanner:use', 'scanner:history',
      'finance:read',
      'members:read', 'members:manage',
    ],
    EVENT_MANAGER: [
      'events:read',
      'scanner:use', 'scanner:history',
    ],
    ATTENDEE: [
      'events:read',
    ],
  };

  const roleMap: Record<RoleName, string> = {} as Record<RoleName, string>;

  for (const [roleName, perms] of Object.entries(rolePermissions)) {
    const role = await prisma.role.upsert({
      where: { name: roleName as RoleName },
      update: {},
      create: {
        name: roleName as RoleName,
        permissions: {
          create: perms.map(action => ({ action })),
        },
      },
    });
    roleMap[roleName as RoleName] = role.id;
  }
  console.log('✅ Roles created');

  // ── 2. Super Admin User ─────────────────────────────────────────────────────
  const superAdminPassword = await bcrypt.hash('SuperAdmin@123', 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@eventura.app' },
    update: {},
    create: {
      email: 'superadmin@eventura.app',
      passwordHash: superAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      isEmailVerified: true,
      isActive: true,
    },
  });
  console.log('✅ Super Admin created');

  // ── 3. Colleges ─────────────────────────────────────────────────────────────
  console.log('Creating colleges...');

  const colleges = [
    {
      name: 'Woxsen University',
      domain: 'woxsen.edu.in',
      logoUrl: null,
      brandingColor: '#2E3192',
      website: 'https://woxsen.edu.in',
      address: 'Kamkole, Sadasivpet, Sangareddy, Telangana 502345',
    },
    {
      name: 'BITS Pilani',
      domain: 'pilani.bits-pilani.ac.in',
      logoUrl: null,
      brandingColor: '#003580',
      website: 'https://www.bits-pilani.ac.in',
      address: 'Vidya Vihar, Pilani, Rajasthan 333031',
    },
    {
      name: 'IIT Hyderabad',
      domain: 'iith.ac.in',
      logoUrl: null,
      brandingColor: '#8B0000',
      website: 'https://iith.ac.in',
      address: 'Kandi, Sangareddy, Telangana 502284',
    },
  ];

  const collegeMap: Record<string, string> = {};

  for (const collegeData of colleges) {
    const college = await prisma.college.upsert({
      where: { domain: collegeData.domain },
      update: { approvalStatus: 'APPROVED', approvedAt: new Date(), approvedBy: superAdmin.id },
      create: {
        ...collegeData,
        approvalStatus: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: superAdmin.id,
      },
    });
    collegeMap[collegeData.name] = college.id;
  }
  console.log('✅ 3 Colleges created (all APPROVED)');

  // ── 4. Clubs ─────────────────────────────────────────────────────────────────
  console.log('Creating clubs...');

  const clubsData = [
    { name: 'TechSoc', description: 'Technology and Innovation Club', collegeKey: 'Woxsen University' },
    { name: 'CulturalFest Committee', description: 'Annual cultural festival organizer', collegeKey: 'Woxsen University' },
    { name: 'BITS CS Association', description: 'Computer Science enthusiasts', collegeKey: 'BITS Pilani' },
    { name: 'Quark Science Club', description: 'Science and research club', collegeKey: 'BITS Pilani' },
    { name: 'IIT-H E-Cell', description: 'Entrepreneurship cell', collegeKey: 'IIT Hyderabad' },
  ];

  const clubMap: Record<string, string> = {};

  for (const club of clubsData) {
    const created = await prisma.club.upsert({
      where: { id: uuidv4() }, // force create since no unique field other than id
      update: {},
      create: {
        name: club.name,
        description: club.description,
        collegeId: collegeMap[club.collegeKey],
        approvalStatus: 'APPROVED',
        approvedAt: new Date(),
      },
    });
    clubMap[club.name] = created.id;
  }

  // Re-query clubs since upsert with random id always creates
  const allClubs = await prisma.club.findMany();
  for (const club of allClubs) {
    clubMap[club.name] = club.id;
  }
  console.log('✅ 5 Clubs created (all APPROVED)');

  // ── 5. Users (3 per college) ─────────────────────────────────────────────────
  console.log('Creating users...');
  const password = await bcrypt.hash('Test@1234', 12);

  interface UserSeedData {
    email: string;
    firstName: string;
    lastName: string;
    collegeKey: string;
    role: RoleName;
    clubName?: string;
  }

  const usersData: UserSeedData[] = [
    // Woxsen
    { email: 'admin@woxsen.edu.in', firstName: 'Arjun', lastName: 'Mehta', collegeKey: 'Woxsen University', role: 'COLLEGE_ADMIN' },
    { email: 'president@woxsen.edu.in', firstName: 'Priya', lastName: 'Sharma', collegeKey: 'Woxsen University', role: 'CLUB_PRESIDENT', clubName: 'TechSoc' },
    { email: 'student@woxsen.edu.in', firstName: 'Rahul', lastName: 'Gupta', collegeKey: 'Woxsen University', role: 'ATTENDEE' },
    // BITS
    { email: 'admin@pilani.bits-pilani.ac.in', firstName: 'Sneha', lastName: 'Joshi', collegeKey: 'BITS Pilani', role: 'COLLEGE_ADMIN' },
    { email: 'president@bits.edu', firstName: 'Karthik', lastName: 'Nair', collegeKey: 'BITS Pilani', role: 'CLUB_PRESIDENT', clubName: 'BITS CS Association' },
    { email: 'student@bits.edu', firstName: 'Ananya', lastName: 'Singh', collegeKey: 'BITS Pilani', role: 'ATTENDEE' },
    // IIT-H
    { email: 'admin@iith.ac.in', firstName: 'Rajesh', lastName: 'Kumar', collegeKey: 'IIT Hyderabad', role: 'COLLEGE_ADMIN' },
    { email: 'president@iith.ac.in', firstName: 'Divya', lastName: 'Reddy', collegeKey: 'IIT Hyderabad', role: 'CLUB_PRESIDENT', clubName: 'IIT-H E-Cell' },
    { email: 'student@iith.ac.in', firstName: 'Vikram', lastName: 'Patel', collegeKey: 'IIT Hyderabad', role: 'ATTENDEE' },
  ];

  const userMap: Record<string, string> = {};

  for (const userData of usersData) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        passwordHash: password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isEmailVerified: true,
        isActive: true,
      },
    });
    userMap[userData.email] = user.id;

    // Assign role
    const clubId = userData.clubName ? (clubMap[userData.clubName] ?? null) : null;
    const existingAssignment = await prisma.roleAssignment.findFirst({
      where: { userId: user.id, roleId: roleMap[userData.role], collegeId: collegeMap[userData.collegeKey] },
    });
    if (!existingAssignment) {
      await prisma.roleAssignment.create({
        data: {
          userId: user.id,
          roleId: roleMap[userData.role],
          collegeId: collegeMap[userData.collegeKey],
          clubId,
          status: 'APPROVED',
        },
      });
    }
  }

  // Super admin role assignment (no college scoping)
  const existingSuperAdminAssignment = await prisma.roleAssignment.findFirst({
    where: { userId: superAdmin.id, roleId: roleMap['SUPER_ADMIN'] },
  });
  if (!existingSuperAdminAssignment) {
    await prisma.roleAssignment.create({
      data: {
        userId: superAdmin.id,
        roleId: roleMap['SUPER_ADMIN'],
        collegeId: collegeMap['Woxsen University'],
        clubId: null,
        status: 'APPROVED',
      },
    });
  }

  console.log('✅ 9 Users created with role assignments');

  // ── 6. Events ─────────────────────────────────────────────────────────────────
  console.log('Creating events...');

  const eventsData = [
    {
      title: 'Annual Innovation Summit 2024',
      description: 'Exploring the frontiers of AI and sustainable technology in higher education.',
      collegeKey: 'Woxsen University',
      clubName: 'TechSoc',
      status: 'PUBLISHED' as EventStatus,
      visibility: 'ALL_PLATFORM' as EventVisibility,
      category: 'Technology',
      format: 'In-Person',
      venue: 'Main Auditorium',
      startDate: new Date('2024-10-15T09:00:00+05:30'),
      endDate: new Date('2024-10-15T17:00:00+05:30'),
      maxCapacity: 350,
      isFree: true,
      ticketPrice: 0,
      readinessScore: 95,
      publishedAt: new Date('2024-10-01'),
    },
    {
      title: 'BITS Hackathon 2024',
      description: '24-hour hackathon for students across India.',
      collegeKey: 'BITS Pilani',
      clubName: 'BITS CS Association',
      status: 'PUBLISHED' as EventStatus,
      visibility: 'SELECTED_COLLEGES' as EventVisibility,
      category: 'Technical',
      format: 'In-Person',
      venue: 'CS Department',
      startDate: new Date('2024-11-01T08:00:00+05:30'),
      endDate: new Date('2024-11-02T08:00:00+05:30'),
      maxCapacity: 200,
      isFree: false,
      ticketPrice: 500,
      readinessScore: 88,
      publishedAt: new Date('2024-10-10'),
    },
    {
      title: 'IIT-H Startup Pitch Night',
      description: 'Pitch your startup idea to VCs and mentors.',
      collegeKey: 'IIT Hyderabad',
      clubName: 'IIT-H E-Cell',
      status: 'DRAFT' as EventStatus,
      visibility: 'ONLY_MY_COLLEGE' as EventVisibility,
      category: 'Entrepreneurship',
      format: 'Hybrid',
      venue: 'Seminar Hall A',
      startDate: new Date('2024-12-05T18:00:00+05:30'),
      endDate: new Date('2024-12-05T21:00:00+05:30'),
      maxCapacity: 100,
      isFree: true,
      ticketPrice: 0,
      readinessScore: 42,
    },
    {
      title: 'Woxsen Cultural Fest 2024',
      description: 'Annual inter-college cultural extravaganza.',
      collegeKey: 'Woxsen University',
      clubName: 'CulturalFest Committee',
      status: 'COMPLETED' as EventStatus,
      visibility: 'ALL_PLATFORM' as EventVisibility,
      category: 'Cultural',
      format: 'In-Person',
      venue: 'Open Amphitheatre',
      startDate: new Date('2024-09-20T10:00:00+05:30'),
      endDate: new Date('2024-09-22T22:00:00+05:30'),
      maxCapacity: 500,
      isFree: true,
      ticketPrice: 0,
      readinessScore: 100,
      publishedAt: new Date('2024-09-01'),
      isMultiDay: true,
    },
    {
      title: 'ML Workshop — Hands-on with PyTorch',
      description: 'Beginner to intermediate machine learning workshop.',
      collegeKey: 'Woxsen University',
      clubName: 'TechSoc',
      status: 'PUBLISHED' as EventStatus,
      visibility: 'ONLY_MY_COLLEGE' as EventVisibility,
      category: 'Technical',
      format: 'In-Person',
      venue: 'Computer Lab 301',
      startDate: new Date('2024-10-28T14:00:00+05:30'),
      endDate: new Date('2024-10-28T18:00:00+05:30'),
      maxCapacity: 60,
      isFree: false,
      ticketPrice: 200,
      readinessScore: 90,
      publishedAt: new Date('2024-10-15'),
    },
  ];

  const eventIds: string[] = [];

  for (const eventData of eventsData) {
    const { collegeKey, clubName, ...rest } = eventData;
    const event = await prisma.event.create({
      data: {
        ...rest,
        collegeId: collegeMap[collegeKey],
        clubId: clubName ? (clubMap[clubName] ?? null) : null,
        startDate: rest.startDate,
        endDate: rest.endDate,
        ticketPrice: rest.ticketPrice,
      },
    });
    eventIds.push(event.id);
  }
  console.log('✅ 5 Events created');

  // ── 7. Registrations (10 total) ────────────────────────────────────────────
  console.log('Creating registrations...');

  const registrationData = [
    // Innovation Summit — free registrations
    { userEmail: 'student@woxsen.edu.in', eventIdx: 0, status: 'CHECKED_IN' as RegistrationStatus, paymentStatus: 'FREE' as PaymentStatus },
    { userEmail: 'student@bits.edu', eventIdx: 0, status: 'CHECKED_IN' as RegistrationStatus, paymentStatus: 'FREE' as PaymentStatus },
    { userEmail: 'student@iith.ac.in', eventIdx: 0, status: 'REGISTERED' as RegistrationStatus, paymentStatus: 'FREE' as PaymentStatus },
    // BITS Hackathon — paid registrations
    { userEmail: 'student@bits.edu', eventIdx: 1, status: 'REGISTERED' as RegistrationStatus, paymentStatus: 'PAID' as PaymentStatus },
    { userEmail: 'student@woxsen.edu.in', eventIdx: 1, status: 'REGISTERED' as RegistrationStatus, paymentStatus: 'PAID' as PaymentStatus },
    // Cultural Fest — completed
    { userEmail: 'student@woxsen.edu.in', eventIdx: 3, status: 'CHECKED_IN' as RegistrationStatus, paymentStatus: 'FREE' as PaymentStatus },
    { userEmail: 'student@bits.edu', eventIdx: 3, status: 'CHECKED_IN' as RegistrationStatus, paymentStatus: 'FREE' as PaymentStatus },
    { userEmail: 'student@iith.ac.in', eventIdx: 3, status: 'CHECKED_IN' as RegistrationStatus, paymentStatus: 'FREE' as PaymentStatus },
    // ML Workshop — paid
    { userEmail: 'student@woxsen.edu.in', eventIdx: 4, status: 'REGISTERED' as RegistrationStatus, paymentStatus: 'PAID' as PaymentStatus },
    { userEmail: 'student@bits.edu', eventIdx: 4, status: 'REGISTERED' as RegistrationStatus, paymentStatus: 'PENDING' as PaymentStatus },
  ];

  const registrationIds: string[] = [];

  for (const reg of registrationData) {
    const userId = userMap[reg.userEmail];
    const eventId = eventIds[reg.eventIdx];
    const idempotencyKey = `${userId}-${eventId}`;

    const created = await prisma.registration.upsert({
      where: { idempotencyKey },
      update: {},
      create: {
        userId,
        eventId,
        status: reg.status,
        paymentStatus: reg.paymentStatus,
        qrToken: `qr_${uuidv4().replace(/-/g, '')}`,
        idempotencyKey,
        checkedInAt: reg.status === 'CHECKED_IN' ? new Date() : null,
      },
    });
    registrationIds.push(created.id);

    // Create payment record for paid registrations
    if (reg.paymentStatus === 'PAID') {
      await prisma.payment.upsert({
        where: { registrationId: created.id },
        update: {},
        create: {
          registrationId: created.id,
          amount: reg.eventIdx === 1 ? 500 : 200,
          platformFee: reg.eventIdx === 1 ? 12.5 : 5,
          organizerAmount: reg.eventIdx === 1 ? 487.5 : 195,
          currency: 'INR',
          status: 'PAID',
          webhookReceived: true,
          idempotencyKey: `pay_${idempotencyKey}`,
          razorpayOrderId: `order_${uuidv4().replace(/-/g, '').slice(0, 14)}`,
          razorpayPaymentId: `pay_${uuidv4().replace(/-/g, '').slice(0, 14)}`,
          paidAt: new Date(),
        },
      });
    }
  }
  console.log('✅ 10 Registrations created');

  // ── 8. Scan Logs (for checked-in registrations) ───────────────────────────
  console.log('Creating scan logs...');

  // Find the Event Manager for Cultural Fest / Innovation Summit
  const eventManagerUser = await prisma.user.findFirst({
    where: { email: 'president@woxsen.edu.in' },
  });

  if (eventManagerUser) {
    const checkedInRegs = await prisma.registration.findMany({
      where: { status: 'CHECKED_IN' },
    });

    for (const reg of checkedInRegs) {
      await prisma.scanLog.create({
        data: {
          registrationId: reg.id,
          scannedBy: eventManagerUser.id,
          result: 'SUCCESS' as ScanResult,
          ipAddress: '192.168.1.100',
          deviceInfo: 'Chrome/120 on Android',
        },
      });
    }

    // One duplicate scan attempt
    if (checkedInRegs.length > 0) {
      await prisma.scanLog.create({
        data: {
          registrationId: checkedInRegs[0].id,
          scannedBy: eventManagerUser.id,
          result: 'DUPLICATE' as ScanResult,
          ipAddress: '192.168.1.100',
          deviceInfo: 'Chrome/120 on Android',
        },
      });
    }
  }
  console.log('✅ Scan logs created');

  // ── 9. Platform Settings ──────────────────────────────────────────────────
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
  console.log('✅ Platform settings initialized');

  console.log('\n🎉 Seed complete!');
  console.log('─────────────────────────────────────────────');
  console.log('Super Admin: superadmin@eventura.app / SuperAdmin@123');
  console.log('Test Users (all passwords: Test@1234):');
  console.log('  admin@woxsen.edu.in    (College Admin — Woxsen)');
  console.log('  president@woxsen.edu.in (Club President — TechSoc)');
  console.log('  student@woxsen.edu.in  (Attendee — Woxsen)');
  console.log('  admin@pilani.bits-pilani.ac.in (College Admin — BITS)');
  console.log('  student@bits.edu       (Attendee — BITS)');
  console.log('  admin@iith.ac.in       (College Admin — IIT-H)');
  console.log('─────────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
