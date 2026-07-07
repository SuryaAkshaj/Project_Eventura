import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Refund Policy — Eventura',
};

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <Link href="/" className="text-indigo-600 text-sm hover:underline">← Back to Eventura</Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Refund Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: June 2026</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-8 text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Attendee Cancellations</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">When you cancel</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Refund amount</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Processing time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-3">More than 48 hours before event</td>
                    <td className="px-4 py-3 text-green-600 font-medium">100% refund</td>
                    <td className="px-4 py-3">5–7 business days</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3">Less than 48 hours before event</td>
                    <td className="px-4 py-3 text-red-500 font-medium">No refund</td>
                    <td className="px-4 py-3">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Organiser Cancellations</h2>
            <p className="mb-3">If an organiser cancels an event:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>All registered attendees receive a 100% automatic refund</li>
              <li>Refunds are processed via Razorpay Route reversal within 5–7 business days</li>
              <li>Platform fees are also refunded in full</li>
              <li>Organisers with a history of last-minute cancellations may have their account reviewed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">How Refunds Work</h2>
            <p className="mb-3">Refunds are processed back to the original payment method:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>UPI payments: refunded to the same UPI ID, typically within 1–3 business days</li>
              <li>Credit/Debit cards: refunded to the card, typically within 5–7 business days</li>
              <li>Net banking: refunded to the same bank account, typically within 3–5 business days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Disputes</h2>
            <p>If you believe you are owed a refund that has not been processed, contact us at{' '}
              <a href="mailto:support@eventura.app" className="text-indigo-600 hover:underline">support@eventura.app</a>{' '}
              with your registration ID and payment details. We aim to resolve all refund disputes within 5 business days.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
