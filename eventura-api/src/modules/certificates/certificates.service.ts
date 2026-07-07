import puppeteer from 'puppeteer';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import { prismaAdmin } from '@config/database';
import { AppError } from '@shared/errors/AppError';
import { getCertificateHTML } from './certificate.template';

export async function generateCertificate(registrationId: string, requestedBy: string, isOrganiser: boolean) {
  // 1. Get registration with full details
  const registration = await prismaAdmin.registration.findUnique({
    where: { id: registrationId },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      event: {
        include: {
          college: { select: { name: true } },
          club: { select: { name: true } },
          createdBy: { select: { firstName: true, lastName: true } },
        }
      },
      certificate: true,
    }
  });

  if (!registration) throw AppError.notFound('Registration not found');

  // 2. Verify requester is the attendee or the organiser
  if (!isOrganiser && registration.userId !== requestedBy) {
    throw AppError.forbidden('You can only download your own certificates');
  }

  // 3. Check eligibility — must be CHECKED_IN
  if (registration.status !== 'CHECKED_IN') {
    throw new AppError(
      'NOT_ELIGIBLE',
      'Certificate is only available after attendance is confirmed via QR check-in',
      400
    );
  }

  // 4. Return existing certificate if already generated
  if (registration.certificate?.pdfUrl) {
    return registration.certificate;
  }

  // 5. Generate certificate ID
  const certificateId = crypto.randomUUID();

  // 6. Build HTML template data
  const attendeeName = `${registration.user.firstName} ${registration.user.lastName}`;
  let organisingBody = 'Eventura Creator';
  if (registration.event.college) {
    organisingBody = registration.event.club
      ? `${registration.event.club.name}, ${registration.event.college.name}`
      : registration.event.college.name;
  } else if (registration.event.createdBy) {
    organisingBody = `${registration.event.createdBy.firstName} ${registration.event.createdBy.lastName}`;
  }
  const eventDate = new Date(registration.event.startDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const issuedAt = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // getCertificateHTML is now async (generates real QR code)
  const html = await getCertificateHTML({
    attendeeName,
    eventTitle: registration.event.title,
    organisingBody,
    eventDate,
    certificateId,
    qrToken: registration.qrToken || certificateId,
    issuedAt,
  });

  // 7. Generate PDF with Puppeteer
  const outputDir = path.join(process.cwd(), 'generated', 'certificates');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName = `certificate-${certificateId}.pdf`;
  const filePath = path.join(outputDir, fileName);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.pdf({
      path: filePath,
      width: '1122px',
      height: '794px',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
  } finally {
    await browser.close();
  }

  // 8. Save certificate record in database
  const certificate = await prismaAdmin.certificate.upsert({
    where: { registrationId },
    update: {
      pdfUrl: `/certificates/download/${certificateId}`,
      blockchainHash: crypto.createHash('sha256').update(`${certificateId}:${registrationId}`).digest('hex'),
      issuedAt: new Date(),
    },
    create: {
      id: certificateId,
      registrationId,
      pdfUrl: `/certificates/download/${certificateId}`,
      blockchainHash: crypto.createHash('sha256').update(`${certificateId}:${registrationId}`).digest('hex'),
      issuedAt: new Date(),
    }
  });

  // 9. Create audit log
  await prismaAdmin.auditLog.create({
    data: {
      userId: requestedBy,
      action: 'CERTIFICATE_GENERATED',
      resourceType: 'CERTIFICATE',
      resourceId: certificateId,
      result: 'SUCCESS',
      details: { certificateId, registrationId, attendeeName }
    }
  });

  return { ...certificate, filePath };
}

export async function downloadCertificate(certificateId: string) {
  const filePath = path.join(
    process.cwd(),
    'generated',
    'certificates',
    `certificate-${certificateId}.pdf`
  );

  if (!fs.existsSync(filePath)) {
    throw AppError.notFound('Certificate file not found. Please regenerate.');
  }

  return filePath;
}

export async function getUserCertificates(userId: string) {
  return prismaAdmin.certificate.findMany({
    where: {
      registration: { userId }
    },
    include: {
      registration: {
        include: {
          event: {
            include: {
              college: { select: { name: true } },
              club: { select: { name: true } },
            }
          }
        }
      }
    },
    orderBy: { issuedAt: 'desc' }
  });
}

export async function verifyCertificate(certificateId: string) {
  const certificate = await prismaAdmin.certificate.findUnique({
    where: { id: certificateId },
    include: {
      registration: {
        include: {
          user: { select: { firstName: true, lastName: true } },
          event: {
            include: {
              college: { select: { name: true } },
              club: { select: { name: true } },
              createdBy: { select: { firstName: true, lastName: true } },
            }
          }
        }
      }
    }
  });

  if (!certificate) {
    return { valid: false, message: 'Certificate not found or invalid' };
  }

  return {
    valid: true,
    certificate: {
      id: certificate.id,
      attendeeName: `${certificate.registration.user.firstName} ${certificate.registration.user.lastName}`,
      eventTitle: certificate.registration.event.title,
      organisingBody: certificate.registration.event.college
        ? (certificate.registration.event.club
            ? `${certificate.registration.event.club.name}, ${certificate.registration.event.college.name}`
            : certificate.registration.event.college.name)
        : (certificate.registration.event.createdBy 
            ? `${certificate.registration.event.createdBy.firstName} ${certificate.registration.event.createdBy.lastName}`
            : 'Eventura Creator'),
      eventDate: certificate.registration.event.startDate,
      issuedAt: certificate.issuedAt,
      blockchainHash: certificate.blockchainHash,
    }
  };
}

export async function bulkGenerateCertificates(eventId: string, organizerCollegeId: string) {
  // Verify event belongs to organiser
  const event = await prismaAdmin.event.findFirst({
    where: { id: eventId, collegeId: organizerCollegeId }
  });
  if (!event) throw AppError.forbidden('Event not found or access denied');

  // Get all checked-in registrations without certificates
  const registrations = await prismaAdmin.registration.findMany({
    where: {
      eventId,
      status: 'CHECKED_IN',
      certificate: null,
    },
    select: { id: true, userId: true }
  });

  const results = await Promise.allSettled(
    registrations.map(reg =>
      generateCertificate(reg.id, reg.userId, true)
    )
  );

  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return { succeeded, failed, total: registrations.length };
}
