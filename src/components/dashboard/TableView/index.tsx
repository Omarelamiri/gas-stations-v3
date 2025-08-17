'use client';

import { useStations } from '@/hooks/useStations';
import { useRouter } from 'next/navigation';

export default function TableView() {
  const { stations, loading, error } = useStations();
  const router = useRouter();

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Gas Stations</h2>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => router.push('/gas-stations/new')}
        >
          Add New
        </button>
      </div>
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Address</th>
            <th className="px-4 py-2 border">Price</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {stations.map((station) => (
            <tr key={station.id} className="hover:bg-gray-50 cursor-pointer">
              <td className="px-4 py-2 border" onClick={() => router.push(`/gas-stations/${station.id}`)}>
                {station.name}
              </td>
              <td className="px-4 py-2 border">{station.address}</td>
              <td className="px-4 py-2 border">{station.price}</td>
              <td className="px-4 py-2 border">
                <button
                  className="px-2 py-1 bg-yellow-500 text-white rounded mr-2 hover:bg-yellow-600"
                  onClick={() => router.push(`/gas-stations/${station.id}`)}
                >
                  View
                </button>
                {/* Future Edit/Delete buttons can go here */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
