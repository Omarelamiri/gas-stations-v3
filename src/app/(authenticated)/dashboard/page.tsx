'use client';

import MapView from '@/components/dashboard/MapView';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <MapView apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} />
    </div>
  );
}
