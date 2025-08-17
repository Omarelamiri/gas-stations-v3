'use client';

import { ReactNode } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 bg-gray-50 p-4">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
