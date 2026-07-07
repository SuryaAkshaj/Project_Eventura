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
    req.user!.activeContext.collegeId!
  );
  return res.json({ success: true, data: result, message: `Generated ${result.succeeded} certificates` });
});
