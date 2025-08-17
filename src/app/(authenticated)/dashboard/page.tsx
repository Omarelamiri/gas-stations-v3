// src/app/(authenticated)/dashboard/page.tsx
'use client';

import { MapView } from '@/components/dashboard/MapView';

export default function DashboardPage() {
  return (
    <div className="h-full">
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Gas stations overview and locations</p>
          </div>
        </div>
      </div>
      
      <div className="px-6 pb-6 h-full">
        <div className="bg-white rounded-lg shadow h-full">
          <MapView />
        </div>
      </div>
    </div>
  );
}