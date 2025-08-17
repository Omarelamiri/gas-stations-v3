import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="container mx-auto grid min-h-[60vh] place-items-center p-6">
      <div className="card max-w-xl text-center">
        <h1 className="mb-2 text-2xl font-semibold">Gas Stations Manager</h1>
        <p className="mb-6 text-gray-600">Next.js 14 + Firebase + Google Maps + Tailwind</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/login" className="btn btn-primary">Log in</Link>
          <Link href="/signup" className="btn border border-gray-300">Sign up</Link>
        </div>
      </div>
    </main>
  )
}