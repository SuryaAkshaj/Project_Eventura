export default function OrgSupportPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Support</h1>
      <p className="text-gray-500 mb-8">Get help with your Eventura account.</p>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-lg">
          <span className="text-2xl">📧</span>
          <div>
            <p className="font-semibold text-gray-800">Email Support</p>
            <p className="text-gray-500 text-sm">support@eventura.app</p>
            <p className="text-gray-400 text-xs mt-1">Response within 24 hours</p>
          </div>
        </div>
        <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-lg">
          <span className="text-2xl">📖</span>
          <div>
            <p className="font-semibold text-gray-800">Documentation</p>
            <p className="text-gray-500 text-sm">Visit our help center for guides and FAQs</p>
          </div>
        </div>
      </div>
    </div>
  );
}
