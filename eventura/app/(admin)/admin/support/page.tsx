export default function AdminSupportPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Platform Support</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Super Admin support resources.</p>
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="flex items-start gap-4 p-4 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
          <span className="text-2xl">🛠️</span>
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">Developer Support</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">admin@eventura.app</p>
          </div>
        </div>
        <div className="flex items-start gap-4 p-4 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
          <span className="text-2xl">📊</span>
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">Platform Health</p>
            <a href="/admin/health" className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline">
              View health dashboard →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
