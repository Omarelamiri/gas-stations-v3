'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { GasStation } from '@/types/station';

interface UseStationsReturn {
  stations: GasStation[];
  loading: boolean;
  error: string | null;
}

export function useStations(): UseStationsReturn {
  const [stations, setStations] = useState<GasStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'gasStations'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: GasStation[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: (doc.data().createdAt as any)?.toDate?.() || new Date(),
          updatedAt: (doc.data().updatedAt as any)?.toDate?.() || new Date(),
        })) as GasStation[];
        setStations(data);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to fetch stations:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { stations, loading, error };
}
