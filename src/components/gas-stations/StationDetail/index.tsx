'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { GasStation } from '@/types/station';

export default function GasStationDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [station, setStation] = useState<GasStation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStation = async () => {
      try {
        const docRef = doc(db, 'gasStations', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as GasStation;
          setStation({ ...data, id: docSnap.id });
        } else {
          alert('Station not found');
          router.push('/table');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStation();
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this station?')) return;
    try {
      await deleteDoc(doc(db, 'gasStations', id));
      router.push('/table');
    } catch (err) {
      console.error(err);
      alert('Failed to delete station');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!station) return null;

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">{station.name}</h1>
      <p><strong>Address:</strong> {station.address}</p>
      <p><strong>Price:</strong> {station.price}</p>
      <p>
        <strong>Coordinates:</strong> Lat: {station.coordinates.lat}, Lng: {station.coordinates.lng}
      </p>
      <div className="mt-4 flex space-x-2">
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          onClick={() => router.back()}
        >
          Back
        </button>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
