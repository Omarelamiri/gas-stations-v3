// src/hooks/useGasStations.ts
'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  createGasStation,
  getGasStations,
  getGasStation,
  updateGasStation,
  deleteGasStation,
  searchGasStations,
  getGasStationsByCity,
  getNearbyGasStations,
} from '@/services/gasStations';
import {
  GasStation,
  CreateGasStationData,
  UpdateGasStationData,
  GasStationFilters,
  PaginatedResponse,
} from '@/types';
import toast from 'react-hot-toast';

interface UseGasStationsReturn {
  // State
  gasStations: GasStation[];
  currentGasStation: GasStation | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchGasStations: (filters?: GasStationFilters, page?: number, pageSize?: number) => Promise<PaginatedResponse<GasStation> | null>;
  fetchGasStation: (id: string) => Promise<GasStation | null>;
  createNewGasStation: (data: CreateGasStationData) => Promise<GasStation | null>;
  updateExistingGasStation: (id: string, data: UpdateGasStationData) => Promise<GasStation | null>;
  removeGasStation: (id: string) => Promise<boolean>;
  searchStations: (searchTerm: string) => Promise<GasStation[]>;
  fetchStationsByCity: (city: string) => Promise<GasStation[]>;
  fetchNearbyStations: (lat: number, lng: number, radius?: number) => Promise<GasStation[]>;
  clearError: () => void;
  setCurrentGasStation: (station: GasStation | null) => void;
}

export const useGasStations = (): UseGasStationsReturn => {
  const { user } = useAuth();
  const [gasStations, setGasStations] = useState<GasStation[]>([]);
  const [currentGasStation, setCurrentGasStation] = useState<GasStation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: unknown, defaultMessage: string) => {
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    setError(errorMessage);
    toast.error(errorMessage);
    console.error(error);
  }, []);

  // Fetch gas stations with filters and pagination
  const fetchGasStations = useCallback(async (
    filters: GasStationFilters = {},
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<GasStation> | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getGasStations(filters, page, pageSize);
      setGasStations(result.data);
      return result;
    } catch (error) {
      handleError(error, 'Failed to fetch gas stations');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  // Fetch a single gas station
  const fetchGasStation = useCallback(async (id: string): Promise<GasStation | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const gasStation = await getGasStation(id);
      setCurrentGasStation(gasStation);
      return gasStation;
    } catch (error) {
      handleError(error, 'Failed to fetch gas station');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  // Create a new gas station
  const createNewGasStation = useCallback(async (
    data: CreateGasStationData
  ): Promise<GasStation | null> => {
    if (!user) {
      toast.error('You must be logged in to create a gas station');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newGasStation = await createGasStation(data, user.id);
      
      // Add to current list
      setGasStations(prev => [newGasStation, ...prev]);
      
      toast.success('Gas station created successfully!');
      return newGasStation;
    } catch (error) {
      handleError(error, 'Failed to create gas station');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, handleError]);

  // Update an existing gas station
  const updateExistingGasStation = useCallback(async (
    id: string,
    data: UpdateGasStationData
  ): Promise<GasStation | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedGasStation = await updateGasStation(id, data);
      
      // Update in current list
      setGasStations(prev => 
        prev.map(station => 
          station.id === id ? updatedGasStation : station
        )
      );
      
      // Update current gas station if it's the one being edited
      if (currentGasStation?.id === id) {
        setCurrentGasStation(updatedGasStation);
      }
      
      toast.success('Gas station updated successfully!');
      return updatedGasStation;
    } catch (error) {
      handleError(error, 'Failed to update gas station');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentGasStation, handleError]);

  // Remove a gas station (soft delete)
  const removeGasStation = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await deleteGasStation(id);
      
      // Remove from current list
      setGasStations(prev => prev.filter(station => station.id !== id));
      
      // Clear current gas station if it's the one being deleted
      if (currentGasStation?.id === id) {
        setCurrentGasStation(null);
      }
      
      toast.success('Gas station deleted successfully!');
      return true;
    } catch (error) {
      handleError(error, 'Failed to delete gas station');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentGasStation, handleError]);

  // Search gas stations
  const searchStations = useCallback(async (searchTerm: string): Promise<GasStation[]> => {
    if (!searchTerm.trim()) {
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await searchGasStations(searchTerm);
      return results;
    } catch (error) {
      handleError(error, 'Failed to search gas stations');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  // Fetch gas stations by city
  const fetchStationsByCity = useCallback(async (city: string): Promise<GasStation[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const stations = await getGasStationsByCity(city);
      return stations;
    } catch (error) {
      handleError(error, 'Failed to fetch gas stations by city');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  // Fetch nearby gas stations
  const fetchNearbyStations = useCallback(async (
    lat: number,
    lng: number,
    radius: number = 10
  ): Promise<GasStation[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const stations = await getNearbyGasStations(lat, lng, radius);
      return stations;
    } catch (error) {
      handleError(error, 'Failed to fetch nearby gas stations');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  return {
    // State
    gasStations,
    currentGasStation,
    isLoading,
    error,
    
    // Actions
    fetchGasStations,
    fetchGasStation,
    createNewGasStation,
    updateExistingGasStation,
    removeGasStation,
    searchStations,
    fetchStationsByCity,
    fetchNearbyStations,
    clearError,
    setCurrentGasStation,
  };
};