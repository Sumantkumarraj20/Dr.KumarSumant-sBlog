import React from 'react'
import Link from 'next/link'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <span className="font-bold text-2xl cursor-pointer hover:text-blue-600 transition-colors duration-300">
              Dr. Kumar Sumant
            </span>
          </Link>
          <nav className="space-x-6">
            <Link href="/">
              <span className="hover:text-blue-600 transition-colors duration-300 cursor-pointer">Home</span>
            </Link>
            <Link href="/contact">
              <span className="hover:text-blue-600 transition-colors duration-300 cursor-pointer">Contact</span>
            </Link>
            <Link href="/chat">
              <span className="hover:text-blue-600 transition-colors duration-300 cursor-pointer">Live Chat</span>
            </Link>
            <Link href="/about"><span className="hover:text-blue-600 transition-colors duration-300 cursor-pointer">About</span></Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 container mx-auto px-6 py-10">{children}</main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="container mx-auto px-6 py-6 text-center text-sm text-slate-600 dark:text-slate-400">
          © {new Date().getFullYear()} Dr. Kumar Sumant · Evidence-based patient education
        </div>
      </footer>
    </div>
  )
}
