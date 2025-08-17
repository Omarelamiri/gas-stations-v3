'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  MapPin,
  SortAsc,
  SortDesc,
  Filter,
} from 'lucide-react';
import { useGasStations } from '@/hooks/useGasStations';
import type { GasStation, TableFilters } from '@/types';

export const TableView: React.FC = () => {
  const { gasStations, loading, error, deleteGasStation } = useGasStations();
  const router = useRouter();
  
  const [filters, setFilters] = useState<TableFilters>({
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filter and sort gas stations
  const filteredAndSortedStations = useMemo(() => {
    let filtered = gasStations.filter(station =>
      station.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      station.address.toLowerCase().includes(filters.search.toLowerCase())
    );

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'address':
          aValue = a.address.toLowerCase();
          bValue = b.address.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [gasStations, filters]);

  const handleSort = (column: TableFilters['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
  };

  const handleView = (station: GasStation) => {
    router.push(`/gas-stations/${station.id}`);
  };

  const handleEdit = (station: GasStation) => {
    router.push(`/gas-stations/${station.id}/edit`);
  };

  const handleDelete = async (station: GasStation) => {
    if (deleteConfirm === station.id) {
      try {
        await deleteGasStation(station.id);
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Error deleting station:', error);
        // You might want to show a toast notification here
      }
    } else {
      setDeleteConfirm(station.id);
      // Auto-cancel delete confirmation after 3 seconds
      setTimeout(() => {
        setDeleteConfirm(null);
      }, 3000);
    }
  };

  const handleAddNew = () => {
    router.push('/gas-stations/new');
  };

  const getSortIcon = (column: TableFilters['sortBy']) => {
    if (filters.sortBy !== column) return null;
    return filters.sortOrder === 'asc' ? 
      <SortAsc className="h-4 w-4" /> : 
      <SortDesc className="h-4 w-4" />;
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
          <div className="text-red-600 text-lg mb-2">Error loading data</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gas Stations</h1>
          <p className="text-gray-600">{filteredAndSortedStations.length} stations found</p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Station</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by name or address..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  {getSortIcon('name')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('address')}
              >
                <div className="flex items-center space-x-1">
                  <span>Address</span>
                  {getSortIcon('address')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center space-x-1">
                  <span>Price/L</span>
                  {getSortIcon('price')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center space-x-1">
                  <span>Added</span>
                  {getSortIcon('createdAt')}
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedStations.map((station) => (
              <tr
                key={station.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleView(station)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{station.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex items-start">
                    <MapPin className="h-4 w-4 mr-1 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span className="line-clamp-2">{station.address}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-green-600">
                    ${station.price.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {station.createdAt.toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleView(station)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(station)}
                      className="text-green-600 hover:text-green-900 p-1 rounded"
                      title="Edit Station"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(station)}
                      className={`p-1 rounded ${
                        deleteConfirm === station.id
                          ? 'text-white bg-red-600 hover:bg-red-700'
                          : 'text-red-600 hover:text-red-900'
                      }`}
                      title={deleteConfirm === station.id ? 'Click again to confirm' : 'Delete Station'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAndSortedStations.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No gas stations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search ? 'Try adjusting your search.' : 'Get started by adding a new gas station.'}
            </p>
            {!filters.search && (
              <div className="mt-6">
                <button
                  onClick={handleAddNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add New Station</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};