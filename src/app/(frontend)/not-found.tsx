import Link from 'next/link'
import React from 'react'

export default function NotFound() {
  return (
    <div className="container py-28">
      <div className="prose max-w-none">
        <h1 style={{ marginBottom: 0 }}>404</h1>
        <p className="mb-4">This page could not be found.</p>
      </div>
      <Link
        href="/"
        className="inline-block bg-black text-white px-6 py-3 rounded-sm hover:bg-gray-800 transition-colors uppercase tracking-wide"
      >
        Go home
      </Link>
    </div>
  )
}
