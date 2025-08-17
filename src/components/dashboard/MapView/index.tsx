'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useRouter } from 'next/navigation';
import { MapPin, Navigation, Plus } from 'lucide-react';
import { useGasStations } from '@/hooks/useGasStations';
import type { GasStation } from '@/types';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '500px',
};

const defaultCenter = {
  lat: 33.5731, // Casablanca coordinates
  lng: -7.5898,
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
};

interface MapViewProps {
  selectedStationId?: string;
}

export const MapView: React.FC<MapViewProps> = ({ selectedStationId }) => {
  const { gasStations, loading, error } = useGasStations();
  const [selectedStation, setSelectedStation] = useState<GasStation | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const router = useRouter();

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setMapCenter(location);
        },
        (error) => {
          console.log('Error getting user location:', error);
          // Keep default center (Casablanca)
        }
      );
    }
  }, []);

  // Focus on selected station if provided
  useEffect(() => {
    if (selectedStationId && gasStations.length > 0) {
      const station = gasStations.find(s => s.id === selectedStationId);
      if (station && mapRef.current) {
        setSelectedStation(station);
        setMapCenter(station.coordinates);
        mapRef.current.panTo(station.coordinates);
        mapRef.current.setZoom(15);
      }
    }
  }, [selectedStationId, gasStations]);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const handleMarkerClick = (station: GasStation) => {
    setSelectedStation(station);
    if (mapRef.current) {
      mapRef.current.panTo(station.coordinates);
    }
  };

  const handleInfoWindowClose = () => {
    setSelectedStation(null);
  };

  const handleViewDetails = (station: GasStation) => {
    router.push(`/gas-stations/${station.id}`);
  };

  const handleAddNewStation = () => {
    router.push('/gas-stations/new');
  };

  const handleCenterOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.panTo(userLocation);
      mapRef.current.setZoom(15);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-2">Error loading map</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        <button
          onClick={handleAddNewStation}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg shadow-lg transition-colors"
          title="Add New Gas Station"
        >
          <Plus className="h-5 w-5" />
        </button>
        
        {userLocation && (
          <button
            onClick={handleCenterOnUser}
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg shadow-lg transition-colors"
            title="Center on My Location"
          >
            <Navigation className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Map Stats */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <span className="font-medium">
            {gasStations.length} Gas Station{gasStations.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Google Map */}
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={12}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={mapOptions}
        >
          {/* User Location Marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }}
              title="Your Location"
            />
          )}

          {/* Gas Station Markers */}
          {gasStations.map((station) => (
            <Marker
              key={station.id}
              position={station.coordinates}
              onClick={() => handleMarkerClick(station)}
              icon={{
                path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                fillColor: station.id === selectedStationId ? '#dc2626' : '#2563eb',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                scale: 1.5,
              }}
              title={station.name}
            />
          ))}

          {/* Info Window */}
          {selectedStation && (
            <InfoWindow
              position={selectedStation.coordinates}
              onCloseClick={handleInfoWindowClose}
            >
              <div className="p-2 max-w-xs">
                <h3 className="font-semibold text-lg mb-2">{selectedStation.name}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="flex items-start">
                    <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                    {selectedStation.address}
                  </p>
                  <p className="font-medium text-green-600">
                    ${selectedStation.price.toFixed(2)}/L
                  </p>
                  <p className="text-xs text-gray-500">
                    Added: {selectedStation.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleViewDetails(selectedStation)}
                  className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  View Details
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};