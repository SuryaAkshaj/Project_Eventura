import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — Eventura',
  description: 'How Eventura collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <Link href="/" className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline">← Back to Eventura</Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Last updated: June 2026</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8 space-y-8 text-gray-600 dark:text-gray-400 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">1. Information We Collect</h2>
            <p className="mb-3">We collect the following information when you use Eventura:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>Account information:</strong> Name, email address, profile photo</li>
              <li><strong>Organisation information:</strong> College/organisation name, domain, city, state</li>
              <li><strong>Event activity:</strong> Events registered for, attendance records, certificates earned</li>
              <li><strong>Payment information:</strong> Transaction IDs, amounts (card/bank details are processed by Razorpay and never stored on our servers)</li>
              <li><strong>Device information:</strong> IP address, browser type, device type (for security and fraud prevention)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>To provide and operate the Eventura platform</li>
              <li>To process event registrations and payments</li>
              <li>To send OTP verification emails and event confirmations</li>
              <li>To generate and verify attendance certificates</li>
              <li>To prevent fraud and abuse of the platform</li>
              <li>To improve our services and user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">3. Third-Party Services</h2>
            <p className="mb-3">We use the following third-party services. Each has its own privacy policy:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>Razorpay</strong> — Payment processing (<a href="https://razorpay.com/privacy/" className="text-indigo-600 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
              <li><strong>Cloudinary</strong> — Image and media storage (<a href="https://cloudinary.com/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
              <li><strong>Resend</strong> — Transactional email delivery (<a href="https://resend.com/legal/privacy-policy" className="text-indigo-600 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">4. Data Retention</h2>
            <p>We retain your data for as long as your account is active, plus 2 years after account closure. Audit logs and financial records are retained for 7 years as required by Indian law. You may request deletion of your account data by contacting us.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">5. Your Rights</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Portability:</strong> Export your event history and certificates</li>
            </ul>
            <p className="mt-3 text-sm">These rights are provided in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act) of India.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">6. Security</h2>
            <p>We protect your data using industry-standard measures including encrypted connections (TLS), JWT authentication with short-lived tokens, Redis-based token blacklisting on logout, and regular security audits.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">7. Contact</h2>
            <p>For privacy concerns or data requests, contact our Data Protection Officer at{' '}
              <a href="mailto:privacy@eventura.app" className="text-indigo-600 dark:text-indigo-400 hover:underline">privacy@eventura.app</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
