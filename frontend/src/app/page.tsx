import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Referral & Affiliate Hub
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Manage your referral codes, track conversions, and calculate payouts
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/programs"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            View Programs
          </Link>
          <Link
            href="/api"
            target="_blank"
            className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            API Documentation
          </Link>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Tracking
          </h2>
          <p className="text-gray-600">
            Track attribution via referral codes (?ref=CODE) or URL slugs (/r/slug)
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Payout Calculation
          </h2>
          <p className="text-gray-600">
            Configure percentage, fixed bounty, or tier-based payout rules
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Admin UI
          </h2>
          <p className="text-gray-600">
            Manage programs, partners, and track payouts from the dashboard
          </p>
        </div>
      </div>
    </div>
  )
}
