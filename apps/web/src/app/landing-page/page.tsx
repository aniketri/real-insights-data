import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8F8F8] text-zinc-900 font-sans">
      <header className="fixed top-0 left-0 right-0 z-10 bg-[#F8F8F8]/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between border-b border-zinc-200 h-20">
            <Link href="/landing-page" className="flex items-center gap-4">
              <div className="size-5">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-semibold">Real Insights</h1>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/login" className="text-sm font-medium hover:text-zinc-600 transition-colors">
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2 text-sm font-medium text-white bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 mt-20">
        <section className="flex flex-col items-center justify-center text-center py-32 px-6 border-b border-zinc-200">
          <h2 className="text-5xl md:text-7xl font-bold leading-tight max-w-3xl">Clarity & Control in Real Estate Debt.</h2>
          <p className="mt-6 text-lg max-w-xl text-zinc-600">
            A place to read, write, and deepen your understanding of your commercial real estate portfolio.
          </p>
          <Link
            href="/signup"
            className="mt-10 px-8 py-3 text-lg font-medium text-white bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors"
          >
            Start Your Free Trial
          </Link>
        </section>

        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-4xl font-bold text-center mb-16">Your All-in-One Debt Management Platform</h3>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
              <div>
                <h4 className="text-2xl font-semibold">Portfolio Visualization</h4>
                <p className="mt-3 text-zinc-600">
                  Gain a high-level view of your entire debt portfolio with key metrics like total loan value, maturity schedules, and performance
                  snapshots, all exportable for your convenience.
                </p>
              </div>
              <div>
                <h4 className="text-2xl font-semibold">Comprehensive Loan Database</h4>
                <p className="mt-3 text-zinc-600">
                  Track every detail of your loans, from original balance and interest calculations to amortization tables and covenant compliance, with
                  dedicated notes and document storage.
                </p>
              </div>
              <div>
                <h4 className="text-2xl font-semibold">Advanced User Features</h4>
                <p className="mt-3 text-zinc-600">
                  Leverage our AI-powered query and data extraction tools to gain deeper insights and streamline your workflow. Set custom alerts and
                  reminders to never miss a critical date.
                </p>
              </div>
              <div>
                <h4 className="text-2xl font-semibold">Enterprise-Grade Security</h4>
                <p className="mt-3 text-zinc-600">
                  Rest easy knowing your data is protected with our secure, permission-based platform, ensuring data integrity and confidentiality for
                  you and your team.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-zinc-500">&copy; {new Date().getFullYear()} Real Insights. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <Link href="#" className="text-zinc-500 hover:text-zinc-900">
                Help
              </Link>
              <Link href="#" className="text-zinc-500 hover:text-zinc-900">
                Status
              </Link>
              <Link href="#" className="text-zinc-500 hover:text-zinc-900">
                Privacy
              </Link>
              <Link href="#" className="text-zinc-500 hover:text-zinc-900">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 