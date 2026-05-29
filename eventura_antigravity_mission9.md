# EVENTURA — ANTIGRAVITY MISSION 9
## Certificates: PDF Generation & Certificate Vault

---

## CRITICAL RULES — READ BEFORE TOUCHING ANY FILE

1. **DO NOT modify any className, color, layout, font, or spacing** — UI is pixel-perfect from Stitch.
2. **DO NOT modify any backend files from previous missions** unless explicitly listed below.
3. **DO NOT modify `prisma/schema.prisma`** — it is complete and migrated.
4. **DO NOT run `prisma migrate`** — schema is already in the database.
5. **Only touch files explicitly listed at the bottom of this prompt.**

---

## PROJECT CONTEXT

### What exists and is working:
- Auth, Events, Registrations, QR, Payments, Admin all complete ✅
- Frontend running on `http://localhost:3001`
- Backend running on `http://localhost:4000`
- Super Admin: `admin@eventura.app` / `Admin@1234`
- Test Attendee: `test@woxsen.edu.in` / `Test@1234`

### Confirmed Prisma Certificate model:
```prisma
model Certificate {
  id              String       @id
  registrationId  String       @unique
  registration    Registration
  pdfUrl          String?
  blockchainHash  String?
  issuedAt        DateTime     @default(now())
}
```

### Certificate is issued when:
- Registration status is `CHECKED_IN`
- Event status is `COMPLETED`
- OR organiser manually triggers certificate generation

### Design system (Deep Indigo #2E3192, Public Sans font):
The certificate PDF must match Eventura's brand:
- Primary color: `#2E3192` (Deep Indigo)
- Secondary color: `#6366F1` (Indigo)
- Font: Public Sans (load from Google Fonts in HTML template)
- Background: white with subtle border
- Logo: "Eventura" text logo in Deep Indigo

### Certificates page already exists:
- `eventura/app/(attendee)/certificates/page.tsx` — built with mock data in Mission 1

---

## PART 1 — INSTALL PACKAGES

### Backend (`eventura-api/`):
```bash
npm install puppeteer
```

Note: Puppeteer downloads Chromium (~170MB) on install. This is expected and required for PDF generation.

---

## PART 2 — BACKEND: CERTIFICATE HTML TEMPLATE

Create `src/modules/certificates/certificate.template.ts`:

This function returns an HTML string that Puppeteer renders to PDF:

```typescript
export function getCertificateHTML(data: {
  attendeeName: string;
  eventTitle: string;
  organisingBody: string;       // Club name + College name
  eventDate: string;            // Formatted date
  certificateId: string;
  qrToken: string;
  issuedAt: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate of Attendance</title>
  <link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Public Sans', sans-serif;
      background: #ffffff;
      width: 1122px;
      height: 794px;
      overflow: hidden;
    }

    .certificate {
      width: 1122px;
      height: 794px;
      background: #ffffff;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 80px;
    }

    /* Decorative border */
    .border-outer {
      position: absolute;
      inset: 20px;
      border: 3px solid #2E3192;
      border-radius: 4px;
    }

    .border-inner {
      position: absolute;
      inset: 28px;
      border: 1px solid #E0E7FF;
      border-radius: 2px;
    }

    /* Corner decorations */
    .corner {
      position: absolute;
      width: 40px;
      height: 40px;
      border-color: #2E3192;
    }
    .corner-tl { top: 14px; left: 14px; border-top: 4px solid; border-left: 4px solid; }
    .corner-tr { top: 14px; right: 14px; border-top: 4px solid; border-right: 4px solid; }
    .corner-bl { bottom: 14px; left: 14px; border-bottom: 4px solid; border-left: 4px solid; }
    .corner-br { bottom: 14px; right: 14px; border-bottom: 4px solid; border-right: 4px solid; }

    .header {
      text-align: center;
      margin-bottom: 28px;
    }

    .logo {
      font-size: 28px;
      font-weight: 800;
      color: #2E3192;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }

    .logo span {
      color: #6366F1;
    }

    .certificate-title {
      font-size: 13px;
      font-weight: 600;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 4px;
    }

    .divider {
      width: 120px;
      height: 3px;
      background: linear-gradient(90deg, #2E3192, #6366F1);
      margin: 20px auto;
      border-radius: 2px;
    }

    .presents {
      font-size: 15px;
      color: #6B7280;
      margin-bottom: 16px;
      font-weight: 400;
    }

    .attendee-name {
      font-size: 52px;
      font-weight: 800;
      color: #2E3192;
      letter-spacing: -1px;
      line-height: 1.1;
      margin-bottom: 16px;
      text-align: center;
    }

    .description {
      font-size: 16px;
      color: #374151;
      text-align: center;
      line-height: 1.6;
      max-width: 700px;
      margin-bottom: 8px;
    }

    .event-title {
      font-size: 22px;
      font-weight: 700;
      color: #1F2937;
      text-align: center;
      margin: 8px 0;
    }

    .organiser {
      font-size: 15px;
      color: #6B7280;
      text-align: center;
      margin-bottom: 4px;
    }

    .event-date {
      font-size: 15px;
      color: #6366F1;
      font-weight: 600;
      text-align: center;
      margin-bottom: 32px;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      width: 100%;
      margin-top: auto;
      padding-top: 24px;
      border-top: 1px solid #E5E7EB;
    }

    .signature-block {
      text-align: center;
    }

    .signature-line {
      width: 160px;
      height: 1px;
      background: #9CA3AF;
      margin-bottom: 6px;
    }

    .signature-name {
      font-size: 12px;
      font-weight: 600;
      color: #374151;
    }

    .signature-title {
      font-size: 11px;
      color: #9CA3AF;
    }

    .qr-block {
      text-align: center;
    }

    .qr-block img {
      width: 80px;
      height: 80px;
    }

    .qr-label {
      font-size: 10px;
      color: #9CA3AF;
      margin-top: 4px;
    }

    .certificate-id {
      font-size: 10px;
      color: #D1D5DB;
      text-align: center;
      margin-top: 8px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #EEF2FF;
      color: #2E3192;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <!-- Decorative borders -->
    <div class="border-outer"></div>
    <div class="border-inner"></div>
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>

    <!-- Header -->
    <div class="header">
      <div class="logo">Event<span>ura</span></div>
      <div class="certificate-title">Certificate of Attendance</div>
    </div>

    <div class="divider"></div>

    <!-- Body -->
    <div class="presents">This certifies that</div>

    <div class="attendee-name">${data.attendeeName}</div>

    <div class="badge">✓ Attendance Verified</div>

    <div class="description">
      has successfully attended
    </div>

    <div class="event-title">${data.eventTitle}</div>

    <div class="organiser">Organised by ${data.organisingBody}</div>

    <div class="event-date">${data.eventDate}</div>

    <!-- Footer -->
    <div class="footer">
      <div class="signature-block">
        <div class="signature-line"></div>
        <div class="signature-name">${data.organisingBody}</div>
        <div class="signature-title">Event Organiser</div>
      </div>

      <div style="text-align: center;">
        <div class="certificate-id">Certificate ID: ${data.certificateId}</div>
        <div class="certificate-id">Issued: ${data.issuedAt}</div>
      </div>

      <div class="qr-block">
        <div class="qr-label">Scan to verify</div>
        <div class="qr-label">${data.certificateId.slice(0, 8).toUpperCase()}</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
```

---

## PART 3 — BACKEND: CERTIFICATES MODULE

Create all files inside `src/modules/certificates/`:

```
src/modules/certificates/
├── certificate.template.ts     ← from Part 2
├── certificates.service.ts
├── certificates.controller.ts
└── certificates.routes.ts
```

---

### `certificates.service.ts`

```typescript
import puppeteer from 'puppeteer';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import { prismaAdmin } from '@config/database';
import { getCertificateHTML } from './certificate.template';
```

---

#### `generateCertificate(registrationId: string, requestedBy: string, isOrganiser: boolean)`

```typescript
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
        }
      },
      certificate: true,
    }
  });

  if (!registration) throw { code: 'NOT_FOUND', message: 'Registration not found', status: 404 };

  // 2. Verify requester is the attendee or the organiser
  if (!isOrganiser && registration.userId !== requestedBy) {
    throw { code: 'FORBIDDEN', message: 'You can only download your own certificates', status: 403 };
  }

  // 3. Check eligibility — must be CHECKED_IN
  if (registration.status !== 'CHECKED_IN') {
    throw {
      code: 'NOT_ELIGIBLE',
      message: 'Certificate is only available after attendance is confirmed via QR check-in',
      status: 400
    };
  }

  // 4. Return existing certificate if already generated
  if (registration.certificate?.pdfUrl) {
    return registration.certificate;
  }

  // 5. Generate certificate ID
  const certificateId = crypto.randomUUID();

  // 6. Build HTML template data
  const attendeeName = `${registration.user.firstName} ${registration.user.lastName}`;
  const organisingBody = registration.event.club
    ? `${registration.event.club.name}, ${registration.event.college.name}`
    : registration.event.college.name;
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

  const html = getCertificateHTML({
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
    await page.setContent(html, { waitUntil: 'networkidle0' });
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
      details: { certificateId, registrationId, attendeeName }
    }
  });

  return { ...certificate, filePath };
}
```

---

#### `downloadCertificate(certificateId: string)`

```typescript
export async function downloadCertificate(certificateId: string) {
  const filePath = path.join(
    process.cwd(),
    'generated',
    'certificates',
    `certificate-${certificateId}.pdf`
  );

  if (!fs.existsSync(filePath)) {
    throw { code: 'NOT_FOUND', message: 'Certificate file not found. Please regenerate.', status: 404 };
  }

  return filePath;
}
```

---

#### `getUserCertificates(userId: string)`

```typescript
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
```

---

#### `verifyCertificate(certificateId: string)`

Public endpoint — anyone can verify a certificate:

```typescript
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
      organisingBody: certificate.registration.event.club
        ? `${certificate.registration.event.club.name}, ${certificate.registration.event.college.name}`
        : certificate.registration.event.college.name,
      eventDate: certificate.registration.event.startDate,
      issuedAt: certificate.issuedAt,
      blockchainHash: certificate.blockchainHash,
    }
  };
}
```

---

#### `bulkGenerateCertificates(eventId: string, organizerCollegeId: string)`

Generates certificates for ALL checked-in attendees of an event at once:

```typescript
export async function bulkGenerateCertificates(eventId: string, organizerCollegeId: string) {
  // Verify event belongs to organiser
  const event = await prismaAdmin.event.findFirst({
    where: { id: eventId, collegeId: organizerCollegeId }
  });
  if (!event) throw { code: 'FORBIDDEN', message: 'Event not found or access denied', status: 403 };

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
```

---

### `certificates.controller.ts`

```typescript
import * as path from 'path';
import { asyncHandler } from '@shared/utils/asyncHandler';
import * as certificatesService from './certificates.service';

// POST /certificates/generate — attendee generates their own certificate
export const generateCertificate = asyncHandler(async (req, res) => {
  const { registrationId } = req.body;
  if (!registrationId) {
    return res.status(400).json({ success: false, error: { code: 'MISSING_FIELD', message: 'registrationId is required' } });
  }
  const certificate = await certificatesService.generateCertificate(
    registrationId,
    req.user!.sub,
    false
  );
  return res.json({ success: true, data: certificate, message: 'Certificate generated successfully' });
});

// GET /certificates/my — get all certificates for logged in user
export const getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await certificatesService.getUserCertificates(req.user!.sub);
  return res.json({ success: true, data: certificates });
});

// GET /certificates/download/:certificateId — download PDF
export const downloadCertificate = asyncHandler(async (req, res) => {
  const filePath = await certificatesService.downloadCertificate(req.params.certificateId);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="eventura-certificate-${req.params.certificateId}.pdf"`);
  res.sendFile(path.resolve(filePath));
});

// GET /certificates/verify/:certificateId — public verification
export const verifyCertificate = asyncHandler(async (req, res) => {
  const result = await certificatesService.verifyCertificate(req.params.certificateId);
  return res.json({ success: true, data: result });
});

// POST /certificates/bulk — organiser bulk generates for event
export const bulkGenerateCertificates = asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  if (!eventId) {
    return res.status(400).json({ success: false, error: { code: 'MISSING_FIELD', message: 'eventId is required' } });
  }
  const result = await certificatesService.bulkGenerateCertificates(
    eventId,
    req.user!.activeContext.collegeId
  );
  return res.json({ success: true, data: result, message: `Generated ${result.succeeded} certificates` });
});
```

---

### `certificates.routes.ts`

```typescript
import { Router } from 'express';
import { authMiddleware } from '@middleware/auth.middleware';
import { requireRole } from '@middleware/rbac.middleware';
import * as certificatesController from './certificates.controller';

const router = Router();

// Public — verify a certificate (no auth needed)
router.get('/verify/:certificateId', certificatesController.verifyCertificate);

// Download PDF (no auth — link shared via email)
router.get('/download/:certificateId', certificatesController.downloadCertificate);

// Attendee routes
router.post('/generate', authMiddleware, certificatesController.generateCertificate);
router.get('/my', authMiddleware, certificatesController.getMyCertificates);

// Organiser routes
router.post(
  '/bulk',
  authMiddleware,
  requireRole('COLLEGE_ADMIN', 'CLUB_PRESIDENT'),
  certificatesController.bulkGenerateCertificates
);

export default router;
```

---

## PART 4 — REGISTER ROUTES IN APP.TS

Add to `src/app.ts` — only these two lines:

```typescript
import certificatesRoutes from '@modules/certificates/certificates.routes';
app.use('/certificates', certificatesRoutes);
```

---

## PART 5 — MANUALLY CHECK IN TEST USER FOR TESTING

Since we need a CHECKED_IN registration to test certificate generation, run this directly against the database:

```bash
docker exec -it eventura_postgres psql -U eventura_user -d eventura -c "
UPDATE \"Registration\" 
SET status = 'CHECKED_IN', \"checkedInAt\" = NOW() 
WHERE \"userId\" = 'f9e27a18-b5c3-41ba-9897-35dd03a35e4a'
LIMIT 1;
"
```

This marks the test user's existing registration as checked in so certificates can be generated.

---

## PART 6 — FRONTEND: CERTIFICATES API CLIENT

Create `eventura/lib/api/certificates.api.ts`:

```typescript
import apiClient from './client';

export const certificatesApi = {
  // Generate certificate for a registration
  generate: (registrationId: string) =>
    apiClient.post('/certificates/generate', { registrationId }),

  // Get all my certificates
  getMyCertificates: () =>
    apiClient.get('/certificates/my'),

  // Download URL (direct link, no axios needed)
  getDownloadUrl: (certificateId: string) =>
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/certificates/download/${certificateId}`,

  // Verify a certificate (public)
  verify: (certificateId: string) =>
    apiClient.get(`/certificates/verify/${certificateId}`),

  // Bulk generate for organiser
  bulkGenerate: (eventId: string) =>
    apiClient.post('/certificates/bulk', { eventId }),
};
```

---

## PART 7 — WIRE CERTIFICATES VAULT PAGE

File: `eventura/app/(attendee)/certificates/page.tsx`

### Add `"use client"` at top if not present.

### Replace mock data with real API:

```typescript
import { certificatesApi } from '@/lib/api/certificates.api';
import { registrationsApi } from '@/lib/api/registrations.api';

const [certificates, setCertificates] = useState<any[]>([]);
const [eligibleRegistrations, setEligibleRegistrations] = useState<any[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [isGenerating, setIsGenerating] = useState<string | null>(null); // registrationId being generated
```

### Fetch certificates and eligible registrations:
```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      const [certsRes, regsRes] = await Promise.all([
        certificatesApi.getMyCertificates(),
        registrationsApi.getMyRegistrations(),
      ]);

      setCertificates(certsRes.data.data);

      // Eligible = CHECKED_IN registrations that don't have a certificate yet
      const certRegIds = new Set(certsRes.data.data.map((c: any) => c.registrationId));
      const eligible = regsRes.data.data.filter(
        (r: any) => r.status === 'CHECKED_IN' && !certRegIds.has(r.id)
      );
      setEligibleRegistrations(eligible);
    } catch (err) {
      console.error('Failed to fetch certificates', err);
    } finally {
      setIsLoading(false);
    }
  };
  fetchData();
}, []);
```

### Wire existing certificate cards to real data:
Map `certificates` to existing certificate card components:
- Event title → `cert.registration.event.title`
- Organiser → `cert.registration.event.club?.name + ', ' + cert.registration.event.college.name`
- Event date → `new Date(cert.registration.event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })`
- Issue date → `new Date(cert.issuedAt).toLocaleDateString('en-IN')`
- Certificate ID → `cert.id.slice(0, 8).toUpperCase()`
- Download button → `href={certificatesApi.getDownloadUrl(cert.id)}` with `target="_blank"`

### Show eligible but not yet generated section:
If `eligibleRegistrations.length > 0` → show a section "Ready to Generate" with cards for each eligible registration and a "Generate Certificate" button:

```typescript
const handleGenerate = async (registrationId: string) => {
  setIsGenerating(registrationId);
  try {
    await certificatesApi.generate(registrationId);
    // Refresh certificates list
    const certsRes = await certificatesApi.getMyCertificates();
    setCertificates(certsRes.data.data);
    setEligibleRegistrations(prev => prev.filter(r => r.id !== registrationId));
  } catch (err: any) {
    alert(err.response?.data?.error?.message || 'Failed to generate certificate');
  } finally {
    setIsGenerating(null);
  }
};
```

Button:
```tsx
<button
  onClick={() => handleGenerate(registration.id)}
  disabled={isGenerating === registration.id}
  className="...existing button classes..."
>
  {isGenerating === registration.id ? 'Generating...' : 'Generate Certificate'}
</button>
```

### Loading skeleton while fetching.

### Empty state when no certificates and no eligible registrations:
Show message: "No certificates yet. Attend events and get checked in to earn certificates."

---

## PART 8 — ADD BULK GENERATE TO LIVE MANAGEMENT HUB

File: `eventura/app/(organiser)/org/events/[id]/manage/page.tsx`

Add a "Generate All Certificates" button to the existing page:

```typescript
const [isBulkGenerating, setIsBulkGenerating] = useState(false);
const [bulkResult, setBulkResult] = useState<any>(null);

const handleBulkGenerate = async () => {
  setIsBulkGenerating(true);
  try {
    const response = await certificatesApi.bulkGenerate(params.id as string);
    setBulkResult(response.data.data);
  } catch (err: any) {
    alert(err.response?.data?.error?.message || 'Failed to generate certificates');
  } finally {
    setIsBulkGenerating(false);
  }
};
```

Add button to existing manage page UI (near the stats section):
```tsx
<button
  onClick={handleBulkGenerate}
  disabled={isBulkGenerating}
  className="...existing secondary button classes..."
>
  {isBulkGenerating ? 'Generating...' : '📄 Generate All Certificates'}
</button>
{bulkResult && (
  <p className="text-sm text-green-600">
    ✓ Generated {bulkResult.succeeded} certificates
    {bulkResult.failed > 0 && ` (${bulkResult.failed} failed)`}
  </p>
)}
```

---

## PART 9 — CREATE PUBLIC CERTIFICATE VERIFICATION PAGE

Create `eventura/app/(public)/certificates/verify/[id]/page.tsx`:

This is a public page — anyone with the certificate ID can verify it.

```tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { certificatesApi } from '@/lib/api/certificates.api';

export default function VerifyCertificatePage() {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();

  useEffect(() => {
    certificatesApi.verify(params.id as string)
      .then(res => setResult(res.data.data))
      .catch(() => setResult({ valid: false, message: 'Certificate not found' }))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  // Match existing public page design system
  // If valid: show green checkmark, attendee name, event title, issue date, blockchain hash
  // If invalid: show red X with "Certificate not found or invalid" message
  // Eventura branding at top
  // "Verified by Eventura" badge if valid
}
```

---

## VERIFICATION STEPS

Run all of these. Do not stop until all pass:

**Backend:**
```bash
# 1. TypeScript check
cd eventura-api && npx tsc --noEmit

# 2. Restart server (Puppeteer needs fresh start)
npm run dev

# 3. Mark test user as checked in
docker exec -it eventura_postgres psql -U eventura_user -d eventura -c "UPDATE \"Registration\" SET status = 'CHECKED_IN', \"checkedInAt\" = NOW() WHERE \"userId\" = 'f9e27a18-b5c3-41ba-9897-35dd03a35e4a' RETURNING id;"

# Copy the registration ID from above output

# 4. Login and get token
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@woxsen.edu.in","password":"Test@1234"}'

# 5. Generate certificate (replace REGISTRATION_ID and TOKEN)
curl -X POST http://localhost:4000/certificates/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"registrationId":"REGISTRATION_ID"}'

# This should return { success: true, data: { id: "...", pdfUrl: "..." } }
# Note: First time runs Puppeteer — takes 5-10 seconds

# 6. Verify certificate (replace CERTIFICATE_ID from above)
curl http://localhost:4000/certificates/verify/CERTIFICATE_ID

# 7. Download certificate in browser
# Open: http://localhost:4000/certificates/download/CERTIFICATE_ID
# Should download a PDF
```

**Frontend:**
```bash
cd eventura && npx tsc --noEmit
```

1. `npx tsc --noEmit` → 0 errors ✅
2. `npm run dev` → starts with no errors ✅
3. Open `/certificates` → shows "Ready to Generate" section for checked-in registrations ✅
4. Click "Generate Certificate" → loading state → certificate appears in list ✅
5. Click Download → PDF downloads with Eventura branding ✅
6. Open `/certificates/verify/[id]` → shows valid certificate details ✅

---

## FILES ALLOWED TO TOUCH — COMPLETE LIST

**Backend — create new:**
- `src/modules/certificates/certificate.template.ts`
- `src/modules/certificates/certificates.service.ts`
- `src/modules/certificates/certificates.controller.ts`
- `src/modules/certificates/certificates.routes.ts`

**Backend — modify existing:**
- `src/app.ts` — add 2 lines only (import + app.use)

**Frontend — create new:**
- `lib/api/certificates.api.ts`
- `app/(public)/certificates/verify/[id]/page.tsx`

**Frontend — modify existing:**
- `app/(attendee)/certificates/page.tsx` — wire real certificates
- `app/(organiser)/org/events/[id]/manage/page.tsx` — add bulk generate button

**Everything else → DO NOT TOUCH.**
