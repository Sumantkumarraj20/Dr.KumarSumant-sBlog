
import React from 'react'
import Link from 'next/link'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/"><a className="font-semibold text-xl">Dr. Kumar Sumant</a></Link>
          <nav className="space-x-4">
            <Link href="/"><a className="hover:underline">Home</a></Link>
            <Link href="/contact"><a className="hover:underline">Contact</a></Link>
            <Link href="/chat"><a className="hover:underline">Live Chat</a></Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 flex-1">{children}</main>
      <footer className="bg-white border-t">
        <div className="container mx-auto px-4 py-6 text-sm text-slate-600">
          © {new Date().getFullYear()} Dr. Kumar Sumant · Evidence-based patient education
        </div>
      </footer>
    </div>
  )
}
