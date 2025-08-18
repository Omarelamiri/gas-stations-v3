// src/app/gas-stations/[id]/edit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { GasStationForm } from '@/components/gas-stations/GasStationForm';
import { useGasStations } from '@/hooks/useGasStations';
import type { GasStation } from '@/types';

export default function EditGasStationPage() {
  const params = useParams();
  const { getGasStationById } = useGasStations();
  const [station, setStation] = useState<GasStation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stationId = params.id as string;

  useEffect(() => {
    const fetchStation = async () => {
      if (!stationId) return;

      try {
        setLoading(true);
        const fetchedStation = await getGasStationById(stationId);
        if (fetchedStation) {
          setStation(fetchedStation);
        } else {
          setError('Gas station not found');
        }
      } catch (err) {
        setError('Failed to load gas station');
      } finally {
        setLoading(false);
      }
    };

    fetchStation();
  }, [stationId, getGasStationById]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-48 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-red-600 text-lg mb-2">Error</div>
            <div className="text-gray-600">{error || 'Gas station not found'}</div>
          </div>
        </div>
      </div>
    );
  }

  return <GasStationForm station={station} mode="edit" />;
}