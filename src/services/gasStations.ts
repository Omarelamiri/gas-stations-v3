// src/services/gasStations.ts
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  GasStation, 
  CreateGasStationData, 
  UpdateGasStationData,
  GasStationFilters,
  PaginatedResponse 
} from '@/types';

const COLLECTION_NAME = 'gasStations';

// Convert Firestore document to GasStation object
const convertDocToGasStation = (doc: DocumentSnapshot): GasStation => {
  const data = doc.data();
  if (!data) throw new Error('Document data is undefined');

  return {
    id: doc.id,
    name: data.name,
    address: data.address,
    city: data.city,
    phone: data.phone || '',
    email: data.email || '',
    location: {
      latitude: data.location.latitude,
      longitude: data.location.longitude,
    },
    services: data.services || [],
    isActive: data.isActive !== false,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    createdBy: data.createdBy,
  };
};

// Create a new gas station
export const createGasStation = async (
  data: CreateGasStationData,
  userId: string
): Promise<GasStation> => {
  try {
    const gasStationData = {
      ...data,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: userId,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), gasStationData);
    const newDoc = await getDoc(docRef);
    
    return convertDocToGasStation(newDoc);
  } catch (error) {
    console.error('Error creating gas station:', error);
    throw new Error('Failed to create gas station');
  }
};

// Get all gas stations with optional filters and pagination
export const getGasStations = async (
  filters: GasStationFilters = {},
  page: number = 1,
  pageSize: number = 10,
  lastDoc?: DocumentSnapshot
): Promise<PaginatedResponse<GasStation>> => {
  try {
    let q = query(collection(db, COLLECTION_NAME));

    // Apply filters
    if (filters.city) {
      q = query(q, where('city', '==', filters.city));
    }

    if (filters.isActive !== undefined) {
      q = query(q, where('isActive', '==', filters.isActive));
    }

    if (filters.services && filters.services.length > 0) {
      q = query(q, where('services', 'array-contains-any', filters.services));
    }

    // Add ordering
    q = query(q, orderBy('createdAt', 'desc'));

    // Add pagination
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    q = query(q, limit(pageSize));

    const querySnapshot = await getDocs(q);
    const gasStations = querySnapshot.docs.map(convertDocToGasStation);

    // Get total count for pagination (this is a simplified approach)
    const totalQuery = query(collection(db, COLLECTION_NAME));
    const totalSnapshot = await getDocs(totalQuery);
    const totalItems = totalSnapshot.size;

    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: gasStations,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: pageSize,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error('Error fetching gas stations:', error);
    throw new Error('Failed to fetch gas stations');
  }
};

// Get a single gas station by ID
export const getGasStation = async (id: string): Promise<GasStation> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Gas station not found');
    }

    return convertDocToGasStation(docSnap);
  } catch (error) {
    console.error('Error fetching gas station:', error);
    throw new Error('Failed to fetch gas station');
  }
};

// Update a gas station
export const updateGasStation = async (
  id: string,
  data: UpdateGasStationData
): Promise<GasStation> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    
    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(docRef, updateData);
    
    // Return updated document
    const updatedDoc = await getDoc(docRef);
    return convertDocToGasStation(updatedDoc);
  } catch (error) {
    console.error('Error updating gas station:', error);
    throw new Error('Failed to update gas station');
  }
};

// Delete a gas station (soft delete by setting isActive to false)
export const deleteGasStation = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      isActive: false,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error deleting gas station:', error);
    throw new Error('Failed to delete gas station');
  }
};

// Permanently delete a gas station
export const permanentlyDeleteGasStation = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error permanently deleting gas station:', error);
    throw new Error('Failed to permanently delete gas station');
  }
};

// Search gas stations by name or address
export const searchGasStations = async (
  searchTerm: string,
  limitCount: number = 10
): Promise<GasStation[]> => {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation that searches by exact matches
    // For better search functionality, consider using Algolia or similar
    
    const nameQuery = query(
      collection(db, COLLECTION_NAME),
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff'),
      orderBy('name'),
      limit(limitCount)
    );

    const addressQuery = query(
      collection(db, COLLECTION_NAME),
      where('address', '>=', searchTerm),
      where('address', '<=', searchTerm + '\uf8ff'),
      orderBy('address'),
      limit(limitCount)
    );

    const [nameSnapshot, addressSnapshot] = await Promise.all([
      getDocs(nameQuery),
      getDocs(addressQuery)
    ]);

    const nameResults = nameSnapshot.docs.map(convertDocToGasStation);
    const addressResults = addressSnapshot.docs.map(convertDocToGasStation);

    // Combine and deduplicate results
    const allResults = [...nameResults, ...addressResults];
    const uniqueResults = allResults.filter((station, index, self) => 
      index === self.findIndex(s => s.id === station.id)
    );

    return uniqueResults.slice(0, limitCount);
  } catch (error) {
    console.error('Error searching gas stations:', error);
    throw new Error('Failed to search gas stations');
  }
};

// Get gas stations by city
export const getGasStationsByCity = async (city: string): Promise<GasStation[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('city', '==', city),
      where('isActive', '==', true),
      orderBy('name')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertDocToGasStation);
  } catch (error) {
    console.error('Error fetching gas stations by city:', error);
    throw new Error('Failed to fetch gas stations by city');
  }
};

// Get gas stations within a geographic radius (simplified version)
export const getNearbyGasStations = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<GasStation[]> => {
  try {
    // This is a simplified implementation
    // For production, consider using GeoFirestore for proper geospatial queries
    
    const allStationsQuery = query(
      collection(db, COLLECTION_NAME),
      where('isActive', '==', true)
    );

    const querySnapshot = await getDocs(allStationsQuery);
    const allStations = querySnapshot.docs.map(convertDocToGasStation);

    // Filter by distance (basic implementation)
    const nearbyStations = allStations.filter(station => {
      const distance = calculateDistance(
        latitude,
        longitude,
        station.location.latitude,
        station.location.longitude
      );
      return distance <= radiusKm;
    });

    // Sort by distance
    return nearbyStations.sort((a, b) => {
      const distanceA = calculateDistance(latitude, longitude, a.location.latitude, a.location.longitude);
      const distanceB = calculateDistance(latitude, longitude, b.location.latitude, b.location.longitude);
      return distanceA - distanceB;
    });
  } catch (error) {
    console.error('Error fetching nearby gas stations:', error);
    throw new Error('Failed to fetch nearby gas stations');
  }
};

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}