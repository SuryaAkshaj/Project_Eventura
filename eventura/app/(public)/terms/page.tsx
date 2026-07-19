import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service — Eventura',
  description: 'Terms and conditions for using Eventura event management platform.',
};

export default function TermsPage() {
  const lastUpdated = 'June 2026';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline">← Back to Eventura</Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2">Terms of Service</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Last updated: {lastUpdated}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8 space-y-8 text-gray-600 dark:text-gray-400 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Eventura (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform. These terms apply to all users including attendees, organisers, and administrators.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">2. User Responsibilities</h2>
            <p className="mb-3">You are responsible for:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Maintaining the security of your account credentials</li>
              <li>All activity that occurs under your account</li>
              <li>Ensuring event information you publish is accurate and not misleading</li>
              <li>Complying with all applicable Indian laws and regulations</li>
              <li>Not using the Platform for fraudulent, illegal, or harmful purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">3. Organiser Responsibilities</h2>
            <p className="mb-3">If you create events on Eventura as an organiser or Team Admin:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>You must deliver the event as described or provide refunds as per our Refund Policy</li>
              <li>You are responsible for obtaining all necessary permissions and licenses for your events</li>
              <li>Eventura is not liable for disputes between organisers and attendees</li>
              <li>Prize money advertised must be distributed as stated — misleading prize claims may result in account suspension</li>
              <li>You grant Eventura a non-exclusive license to display your event information on the Platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">4. Payments and Platform Fee</h2>
            <p className="mb-3">Payments on Eventura are processed via Razorpay, a licensed payment aggregator regulated by the RBI.</p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Eventura charges a platform fee on paid events as configured by the Super Admin. This fee is disclosed before event creation.</li>
              <li>Refunds are governed by our <Link href="/refunds" className="text-indigo-600 dark:text-indigo-400 hover:underline">Refund Policy</Link></li>
              <li>Payments are transferred directly to organisers via Razorpay Route</li>
              <li>Eventura is not responsible for failed payments due to bank or payment gateway issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">5. QR Codes and Check-in</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>QR codes are unique to each registration and must not be shared or duplicated</li>
              <li>Fraudulent use of QR codes (including screenshot sharing) is prohibited and may result in account termination</li>
              <li>QR codes contain time-limited nonces and are verified cryptographically at check-in</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">6. Certificates</h2>
            <p>Certificates issued by Eventura are based on verified QR check-in records. Fraudulent attendance claims are a violation of these terms. Certificate data is immutable once issued.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">7. Account Termination</h2>
            <p>Eventura reserves the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, misrepresent event details, or abuse the Platform in any way. Organisers whose accounts are terminated forfeit their right to future payouts for pending events.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">8. Limitation of Liability</h2>
            <p>Eventura is a technology platform that facilitates event management. We are not responsible for the quality, safety, or delivery of any event. Our liability is limited to the platform fee collected for any given transaction.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">9. Governing Law</h2>
            <p>These terms are governed by the laws of India, including the Information Technology Act, 2000. Any disputes shall be subject to the exclusive jurisdiction of courts in Hyderabad, Telangana, India.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">10. Contact</h2>
            <p>For questions about these terms, contact us at{' '}
              <a href="mailto:legal@eventura.app" className="text-indigo-600 dark:text-indigo-400 hover:underline">legal@eventura.app</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
