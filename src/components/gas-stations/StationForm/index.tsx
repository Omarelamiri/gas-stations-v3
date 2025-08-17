'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { GasStation } from '@/types/station';

export default function StationForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    address: '',
    price: '',
    lat: '',
    lng: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.address || !form.price || !form.lat || !form.lng) {
      setError('All fields are required');
      return;
    }

    const newStation: Omit<GasStation, 'id'> = {
      name: form.name,
      address: form.address,
      price: parseFloat(form.price),
      coordinates: { lat: parseFloat(form.lat), lng: parseFloat(form.lng) },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setLoading(true);
    try {
      await addDoc(collection(db, 'gasStations'), {
        ...newStation,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      router.push('/table');
    } catch (err) {
      console.error(err);
      setError('Failed to create station');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Create New Gas Station</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Name"
          className="w-full border px-3 py-2 rounded"
          value={form.name}
          onChange={handleChange}
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          className="w-full border px-3 py-2 rounded"
          value={form.address}
          onChange={handleChange}
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          className="w-full border px-3 py-2 rounded"
          value={form.price}
          onChange={handleChange}
        />
        <input
          type="number"
          name="lat"
          placeholder="Latitude"
          className="w-full border px-3 py-2 rounded"
          value={form.lat}
          onChange={handleChange}
        />
        <input
          type="number"
          name="lng"
          placeholder="Longitude"
          className="w-full border px-3 py-2 rounded"
          value={form.lng}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Create'}
        </button>
      </form>
    </div>
  );
}
