export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
      <p className="text-gray-500 mb-8">Last updated: June 2026</p>
      <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
        <p>Eventura is committed to protecting your privacy. This policy explains how we collect and use your information.</p>
        <h2 className="text-xl font-semibold text-gray-800">Information We Collect</h2>
        <p>We collect your name, email address, and college affiliation when you register. Payment information is processed by Razorpay and never stored on our servers.</p>
        <h2 className="text-xl font-semibold text-gray-800">How We Use Your Information</h2>
        <p>We use your information to provide event registration services, send OTP verification emails, and generate attendance certificates.</p>
        <h2 className="text-xl font-semibold text-gray-800">Contact</h2>
        <p>For privacy concerns, contact support@eventura.app</p>
      </div>
    </div>
  );
}
