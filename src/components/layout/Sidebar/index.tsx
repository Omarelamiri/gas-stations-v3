'use client';

import Link from 'next/link';
import LogoutButton from '@/components/ui/LogoutButton';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r p-4 flex flex-col justify-between">
      <nav className="space-y-2">
        <Link href="/dashboard" className="block px-2 py-1 rounded hover:bg-gray-100">Dashboard</Link>
        <Link href="/table" className="block px-2 py-1 rounded hover:bg-gray-100">Table</Link>
        <Link href="/reports" className="block px-2 py-1 rounded hover:bg-gray-100">Reports</Link>
      </nav>
      <div className="mt-auto">
        <LogoutButton />
      </div>
    </aside>
  );
}
