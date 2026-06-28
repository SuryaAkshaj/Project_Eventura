export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h1>
      <p className="text-gray-500 mb-8">Last updated: June 2026</p>
      <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
        <p>By using Eventura, you agree to these terms of service. Eventura provides event management services for colleges and organisations.</p>
        <h2 className="text-xl font-semibold text-gray-800">1. Use of Service</h2>
        <p>You must be at least 16 years old to use Eventura. You are responsible for maintaining the security of your account.</p>
        <h2 className="text-xl font-semibold text-gray-800">2. Events and Payments</h2>
        <p>Event organisers are responsible for the accuracy of event information. Payments are processed securely through Razorpay.</p>
        <h2 className="text-xl font-semibold text-gray-800">3. Contact</h2>
        <p>For questions about these terms, contact support@eventura.app</p>
      </div>
    </div>
  );
}
