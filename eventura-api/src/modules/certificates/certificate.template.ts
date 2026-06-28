import QRCode from 'qrcode';

export async function getCertificateHTML(data: {
  attendeeName: string;
  eventTitle: string;
  organisingBody: string;       // Club name + College name
  eventDate: string;            // Formatted date
  certificateId: string;
  qrToken: string;
  issuedAt: string;
}): Promise<string> {
  // Generate QR code as data URL pointing to verification URL
  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/certificates/verify/${data.certificateId}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 80,
    margin: 1,
    color: { dark: '#2E3192', light: '#FFFFFF' },
  });

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

    <div class="badge">&#10003; Attendance Verified</div>

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
        <img src="${qrDataUrl}" width="80" height="80" alt="Verify certificate" />
        <div class="qr-label">Scan to verify</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
