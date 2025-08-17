'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  DollarSign,
  Save,
  ArrowLeft,
  Navigation,
  AlertCircle,
} from 'lucide-react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useGasStations } from '@/hooks/useGasStations';
import type { GasStation, GasStationFormData, CreateGasStationData, UpdateGasStationData } from '@/types';

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

interface GasStationFormProps {
  station?: GasStation;
  mode: 'create' | 'edit';
}

export const GasStationForm: React.FC<GasStationFormProps> = ({ station, mode }) => {
  const router = useRouter();
  const { createGasStation, updateGasStation } = useGasStations();

  const [formData, setFormData] = useState<GasStationFormData>({
    name: station?.name || '',
    address: station?.address || '',
    price: station?.price?.toString() || '',
    coordinates: {
      lat: station?.coordinates.lat?.toString() || '',
      lng: station?.coordinates.lng?.toString() || '',
    },
  });

  const [mapCenter, setMapCenter] = useState({
    lat: station?.coordinates.lat || 33.5731, // Casablanca default
    lng: station?.coordinates.lng || -7.5898,
  });

  const [markerPosition, setMarkerPosition] = useState(mapCenter);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update map when coordinates change in form
  useEffect(() => {
    const lat = parseFloat(formData.coordinates.lat);
    const lng = parseFloat(formData.coordinates.lng);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      setMapCenter({ lat, lng });
      setMarkerPosition({ lat, lng });
    }
  }, [formData.coordinates]);

  // Get user's current location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMapCenter(location);
          setMarkerPosition(location);
          setFormData(prev => ({
            ...prev,
            coordinates: {
              lat: location.lat.toString(),
              lng: location.lng.toString(),
            },
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please enter coordinates manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Handle map click to set marker position
  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setMarkerPosition({ lat, lng });
      setFormData(prev => ({
        ...prev,
        coordinates: {
          lat: lat.toString(),
          lng: lng.toString(),
        },
      }));
    }
  }, []);

  // Handle marker drag
  const handleMarkerDrag = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setMarkerPosition({ lat, lng });
      setFormData(prev => ({
        ...prev,
        coordinates: {
          lat: lat.toString(),
          lng: lng.toString(),
        },
      }));
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Station name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price) || price <= 0) {
      newErrors.price = 'Valid price is required';
    }

    const lat = parseFloat(formData.coordinates.lat);
    const lng = parseFloat(formData.coordinates.lng);
    
    if (!formData.coordinates.lat || isNaN(lat) || lat < -90 || lat > 90) {
      newErrors.lat = 'Valid latitude is required (-90 to 90)';
    }

    if (!formData.coordinates.lng || isNaN(lng) || lng < -180 || lng > 180) {
      newErrors.lng = 'Valid longitude is required (-180 to 180)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const data = mode === 'create' ? {
        name: formData.name.trim(),
        address: formData.address.trim(),
        price: parseFloat(formData.price),
        coordinates: {
          lat: parseFloat(formData.coordinates.lat),
          lng: parseFloat(formData.coordinates.lng),
        },
      } as CreateGasStationData : {
        name: formData.name.trim(),
        address: formData.address.trim(),
        price: parseFloat(formData.price),
        coordinates: {
          lat: parseFloat(formData.coordinates.lat),
          lng: parseFloat(formData.coordinates.lng),
        },
      } as UpdateGasStationData;

      if (mode === 'create') {
        const newStationId = await createGasStation(data as CreateGasStationData);
        router.push(`/gas-stations/${newStationId}`);
      } else {
        if (station) {
          await updateGasStation(station.id, data as UpdateGasStationData);
          router.push(`/gas-stations/${station.id}`);
        }
      }
    } catch (error) {
      console.error('Error saving station:', error);
      alert('Failed to save gas station. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleInputChange = (field: keyof GasStationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCoordinateChange = (coord: 'lat' | 'lng', value: string) => {
    setFormData(prev => ({
      ...prev,
      coordinates: { ...prev.coordinates, [coord]: value }
    }));
    // Clear error when user starts typing
    if (errors[coord]) {
      setErrors(prev => ({ ...prev, [coord]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Add New Gas Station' : 'Edit Gas Station'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Station Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter station name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Liter ($) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.price ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.price}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={2}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.address ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter full address"
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.address}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Location</h2>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Navigation className="h-4 w-4" />
                <span>Use Current Location</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.coordinates.lat}
                  onChange={(e) => handleCoordinateChange('lat', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.lat ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="33.5731"
                />
                {errors.lat && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.lat}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.coordinates.lng}
                  onChange={(e) => handleCoordinateChange('lng', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.lng ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="-7.5898"
                />
                {errors.lng && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.lng}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-lg overflow-hidden border">
              <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCenter}
                  zoom={13}
                  options={mapOptions}
                  onClick={handleMapClick}
                >
                  <Marker
                    position={markerPosition}
                    draggable={true}
                    onDragEnd={handleMarkerDrag}
                    icon={{
                      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                      fillColor: '#dc2626',
                      fillOpacity: 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 2,
                      scale: 1.5,
                    }}
                  />
                </GoogleMap>
              </LoadScript>
            </div>

            <p className="mt-2 text-sm text-gray-600">
              Click on the map or drag the marker to set the location, or enter coordinates manually above.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : mode === 'create' ? 'Create Station' : 'Update Station'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};