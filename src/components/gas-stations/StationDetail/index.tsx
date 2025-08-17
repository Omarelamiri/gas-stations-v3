'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  ArrowLeft,
  Edit,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useGasStations } from '@/hooks/useGasStations';
import type { GasStation } from '@/types';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

export default function GasStationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getGasStationById, deleteGasStation } = useGasStations();
  
  const [station, setStation] = useState<GasStation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

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
        setError('Failed to load gas station details');
      } finally {
        setLoading(false);
      }
    };

    fetchStation();
  }, [stationId, getGasStationById]);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push(`/gas-stations/${stationId}/edit`);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      // Auto-cancel delete confirmation after 5 seconds
      setTimeout(() => setDeleteConfirm(false), 5000);
      return;
    }

    try {
      await deleteGasStation(stationId);
      router.push('/table');
    } catch (error) {
      console.error('Error deleting station:', error);
      setDeleteConfirm(false);
      // You might want to show a toast notification here
    }
  };

  const handleGetDirections = () => {
    if (station) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${station.coordinates.lat},${station.coordinates.lng}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-12 bg-gray-300 rounded mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
              <div className="h-48 bg-gray-300 rounded"></div>
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
          <button
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-red-600 text-lg mb-2">Error</div>
            <div className="text-gray-600">{error || 'Gas station not found'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                deleteConfirm
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-100 hover:bg-red-200 text-red-700'
              }`}
            >
              <Trash2 className="h-4 w-4" />
              <span>{deleteConfirm ? 'Confirm Delete' : 'Delete'}</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow">
          {/* Station Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{station.name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Address</div>
                  <div className="text-gray-900">{station.address}</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Price per Liter</div>
                  <div className="text-2xl font-bold text-green-600">
                    ${station.price.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Added</div>
                  <div className="text-gray-900">
                    {station.createdAt.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </div>

            {station.updatedAt.getTime() !== station.createdAt.getTime() && (
              <div className="mt-4 flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>
                  Last updated: {station.updatedAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Map Section */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Location</h2>
              <button
                onClick={handleGetDirections}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Get Directions</span>
              </button>
            </div>

            <div className="rounded-lg overflow-hidden border">
              <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={station.coordinates}
                  zoom={15}
                  options={mapOptions}
                >
                  <Marker
                    position={station.coordinates}
                    icon={{
                      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                      fillColor: '#dc2626',
                      fillOpacity: 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 2,
                      scale: 1.5,
                    }}
                    title={station.name}
                  />
                </GoogleMap>
              </LoadScript>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Coordinates</h3>
              <div className="text-sm text-gray-600">
                <div>Latitude: {station.coordinates.lat}</div>
                <div>Longitude: {station.coordinates.lng}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}