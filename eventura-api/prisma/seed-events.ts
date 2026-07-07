import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedEvents() {
  // Get Woxsen college and its first approved club
  const woxsen = await prisma.college.findFirst({
    where: { name: 'Woxsen University' },
    include: { clubs: { where: { approvalStatus: 'APPROVED' } } },
  });

  if (!woxsen) {
    console.log('Woxsen college not found — run main seed first: npm run db:seed');
    await prisma.$disconnect();
    return;
  }

  const club = woxsen.clubs[0];

  console.log(`Found college: ${woxsen.name} (${woxsen.id})`);
  console.log(`Found club: ${club?.name ?? 'none'}`);

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const hour = 60 * 60 * 1000;

  const events = await Promise.all([
    // 1. Published free event — ALL_PLATFORM (visible to everyone)
    prisma.event.create({
      data: {
        title: 'TechFest 2026 — Annual Technology Festival',
        description:
          'Join us for the biggest tech event of the year featuring workshops, hackathons, and speaker sessions from industry leaders.',
        collegeId: woxsen.id,
        clubId: club?.id ?? null,
        visibility: 'ALL_PLATFORM',
        status: 'PUBLISHED',
        category: 'Technical',
        format: 'In-Person',
        venue: 'Woxsen University Main Auditorium',
        startDate: new Date(now + 7 * day),
        endDate: new Date(now + 8 * day),
        maxCapacity: 500,
        ticketPrice: 0,
        isFree: true,
        readinessScore: 90,
        publishedAt: new Date(),
        sessions: {
          create: [
            {
              title: 'Opening Keynote',
              startTime: new Date(now + 7 * day),
              endTime: new Date(now + 7 * day + 2 * hour),
              speakerName: 'Dr. Rajesh Kumar',
            },
            {
              title: 'AI/ML Workshop',
              startTime: new Date(now + 7 * day + 3 * hour),
              endTime: new Date(now + 7 * day + 5 * hour),
              venue: 'Lab Block A',
            },
          ],
        },
      },
    }),

    // 2. Published paid event — ONLY_MY_COLLEGE
    prisma.event.create({
      data: {
        title: 'Design Thinking Bootcamp',
        description:
          'A two-day immersive bootcamp on design thinking methodology and UX research techniques.',
        collegeId: woxsen.id,
        visibility: 'ONLY_MY_COLLEGE',
        status: 'PUBLISHED',
        category: 'Workshop',
        format: 'In-Person',
        venue: 'Design Studio, Block C',
        startDate: new Date(now + 14 * day),
        endDate: new Date(now + 15 * day),
        maxCapacity: 50,
        ticketPrice: 499,
        isFree: false,
        readinessScore: 85,
        publishedAt: new Date(),
      },
    }),

    // 3. Draft event — not visible in public feed
    prisma.event.create({
      data: {
        title: 'Entrepreneurship Summit 2026',
        description:
          'Connect with founders, investors, and mentors at our annual entrepreneurship summit.',
        collegeId: woxsen.id,
        visibility: 'ALL_PLATFORM',
        status: 'DRAFT',
        category: 'Networking',
        format: 'Hybrid',
        startDate: new Date(now + 30 * day),
        endDate: new Date(now + 30 * day + 8 * hour),
        maxCapacity: 200,
        ticketPrice: 999,
        isFree: false,
        readinessScore: 40,
      },
    }),

    // 4. Paid event — ALL_PLATFORM (Mission 7: Razorpay payment flow testing)
    prisma.event.create({
      data: {
        title: 'Full-Stack Development Masterclass',
        description:
          'An intensive workshop covering React, Node.js, PostgreSQL and deployment. Certificate provided on completion.',
        collegeId: woxsen.id,
        clubId: club?.id ?? null,
        visibility: 'ALL_PLATFORM',
        status: 'PUBLISHED',
        category: 'Workshop',
        format: 'In-Person',
        venue: 'Computer Lab Block B',
        startDate: new Date(now + 10 * day),
        endDate: new Date(now + 10 * day + 6 * hour),
        maxCapacity: 30,
        ticketPrice: 299,
        isFree: false,
        readinessScore: 88,
        publishedAt: new Date(),
      },
    }),
  ]);

  console.log(`✅ Seeded ${events.length} events:`);
  events.forEach(e => console.log(`   - ${e.title} [${e.status}]`));

  await prisma.$disconnect();
}

seedEvents().catch(async (err) => {
  console.error('Seed failed:', err);
  await prisma.$disconnect();
  const process = require('process');
  process.exit(1);
});
