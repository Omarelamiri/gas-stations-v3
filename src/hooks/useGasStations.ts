import { useState, useEffect } from 'react';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import type { GasStation, CreateGasStationData, UpdateGasStationData } from '@/types';

interface UseGasStationsReturn {
  gasStations: GasStation[];
  loading: boolean;
  error: string | null;
  createGasStation: (data: CreateGasStationData) => Promise<string>;
  updateGasStation: (id: string, data: UpdateGasStationData) => Promise<void>;
  deleteGasStation: (id: string) => Promise<void>;
  getGasStationById: (id: string) => Promise<GasStation | null>;
  refreshData: () => void;
}

export const useGasStations = (): UseGasStationsReturn => {
  const [gasStations, setGasStations] = useState<GasStation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time subscription to gas stations
  useEffect(() => {
    const gasStationsRef = collection(db, 'gasStations');
    const q = query(gasStationsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const stations: GasStation[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            stations.push({
              id: doc.id,
              name: data.name,
              address: data.address,
              price: data.price,
              coordinates: data.coordinates,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            });
          });
          setGasStations(stations);
          setError(null);
        } catch (err) {
          console.error('Error processing gas stations data:', err);
          setError('Failed to load gas stations data');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching gas stations:', err);
        setError('Failed to fetch gas stations');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Create a new gas station
  const createGasStation = async (data: CreateGasStationData): Promise<string> => {
    try {
      const gasStationsRef = collection(db, 'gasStations');
      const now = Timestamp.now();
      
      const docRef = await addDoc(gasStationsRef, {
        ...data,
        createdAt: now,
        updatedAt: now,
      });

      return docRef.id;
    } catch (err) {
      console.error('Error creating gas station:', err);
      throw new Error('Failed to create gas station');
    }
  };

  // Update an existing gas station
  const updateGasStation = async (id: string, data: UpdateGasStationData): Promise<void> => {
    try {
      const gasStationRef = doc(db, 'gasStations', id);
      
      await updateDoc(gasStationRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (err) {
      console.error('Error updating gas station:', err);
      throw new Error('Failed to update gas station');
    }
  };

  // Delete a gas station
  const deleteGasStation = async (id: string): Promise<void> => {
    try {
      const gasStationRef = doc(db, 'gasStations', id);
      await deleteDoc(gasStationRef);
    } catch (err) {
      console.error('Error deleting gas station:', err);
      throw new Error('Failed to delete gas station');
    }
  };

  // Get a single gas station by ID
  const getGasStationById = async (id: string): Promise<GasStation | null> => {
    try {
      const gasStationRef = doc(db, 'gasStations', id);
      const docSnap = await getDoc(gasStationRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          address: data.address,
          price: data.price,
          coordinates: data.coordinates,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }
      return null;
    } catch (err) {
      console.error('Error fetching gas station:', err);
      throw new Error('Failed to fetch gas station');
    }
  };

  // Refresh data (force re-fetch)
  const refreshData = () => {
    setLoading(true);
    // The real-time listener will automatically update the data
  };

  return {
    gasStations,
    loading,
    error,
    createGasStation,
    updateGasStation,
    deleteGasStation,
    getGasStationById,
    refreshData,
  };
};