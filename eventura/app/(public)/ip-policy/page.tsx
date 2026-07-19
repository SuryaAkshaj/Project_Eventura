import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Intellectual Property Policy — Eventura',
};

export default function IPPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <Link href="/" className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline">← Back to Eventura</Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2">Intellectual Property Policy</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Last updated: June 2026</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8 space-y-8 text-gray-600 dark:text-gray-400 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Eventura Trademarks</h2>
            <p>&quot;Eventura&quot; and the Eventura logo are trademarks of Eventura. You may not use these marks without our prior written permission.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Organiser Content</h2>
            <p className="mb-3">Organisers retain ownership of all content they upload to Eventura, including:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Event descriptions, posters, and images</li>
              <li>Schedule and session details</li>
              <li>Any other materials submitted through the Platform</li>
            </ul>
            <p className="mt-3">By uploading content, you grant Eventura a non-exclusive, royalty-free license to display, distribute, and promote your content in connection with operating the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">DMCA Takedown Process</h2>
            <p className="mb-3">If you believe content on Eventura infringes your intellectual property rights, send a takedown notice to{' '}
              <a href="mailto:dmca@eventura.app" className="text-indigo-600 dark:text-indigo-400 hover:underline">dmca@eventura.app</a>{' '}
              including:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Description of the copyrighted work allegedly infringed</li>
              <li>URL of the allegedly infringing content on Eventura</li>
              <li>Your contact information</li>
              <li>A statement of good faith belief that the use is not authorised</li>
              <li>Your signature (electronic or physical)</li>
            </ul>
            <p className="mt-3">We aim to respond to valid DMCA notices within 5 business days.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Platform Liability</h2>
            <p>Eventura is a platform that hosts user-generated content. We are not responsible for intellectual property infringement by third parties. We will respond promptly to valid infringement notices and remove infringing content.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
