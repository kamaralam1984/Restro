'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '@/services/api';

interface Table {
  _id: string;
  tableNumber: string;
  capacity: number;
  status: 'available' | 'booked' | 'reserved' | 'maintenance';
  location: {
    row: number;
    column: number;
    section: string;
  };
  hourlyRate?: number;
  discountThreshold?: number;
  discountAmount?: number;
}

interface TableLayoutProps {
  selectedDate: string;
  selectedTime: string;
  numberOfGuests: number;
  /** Called with full table so parent can use rate/offer */
  onTableSelect: (table: Table) => void;
  selectedTable?: string;
  /** Restaurant slug for multi-tenant table fetch (required for booking page) */
  restaurantSlug?: string;
}

export default function TableLayout({
  selectedDate,
  selectedTime,
  numberOfGuests,
  onTableSelect,
  selectedTable,
  restaurantSlug,
}: TableLayoutProps) {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDate && selectedTime) {
      loadTables();
    } else {
      setTables([]);
      setLoading(false);
    }
  }, [selectedDate, selectedTime, numberOfGuests]);

  const loadTables = async () => {
    try {
      setLoading(true);
      console.log('Loading tables for:', { selectedDate, selectedTime });
      
      const params: Record<string, string> = {
        date: selectedDate,
        time: selectedTime,
      };
      if (restaurantSlug) params.restaurant = restaurantSlug;

      let data;
      try {
        data = await api.get<Table[]>('/tables', { params });
      } catch (paramError: any) {
        console.warn('Failed with params, trying without:', paramError);
        data = await api.get<Table[]>('/tables', {
          params: restaurantSlug ? { restaurant: restaurantSlug } : {},
        });
      }
      
      console.log('Tables loaded:', data);
      setTables(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to load tables:', error);
      console.error('Error details:', error?.response?.data || error?.message);
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  const getTableStatus = (table: Table) => {
    if (table.status === 'booked' || table.status === 'reserved') {
      return 'booked';
    }
    if (table.status === 'maintenance') {
      return 'maintenance';
    }
    if (table.capacity < numberOfGuests) {
      return 'too-small';
    }
    return 'available';
  };

  const getTableColor = (table: Table) => {
    const status = getTableStatus(table);
    if (status === 'booked') return 'bg-red-500';
    if (status === 'maintenance') return 'bg-gray-500';
    if (status === 'too-small') return 'bg-yellow-500';
    if (selectedTable === table.tableNumber) return 'bg-pink-600';
    if (hoveredTable === table.tableNumber) return 'bg-pink-400';
    return 'bg-green-500';
  };

  const getTableIcon = (table: Table) => {
    const status = getTableStatus(table);
    if (status === 'booked') return <XCircle className="w-5 h-5" />;
    if (status === 'maintenance') return <Clock className="w-5 h-5" />;
    if (status === 'too-small') return <Users className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
  };

  // Group tables by section
  const tablesBySection = tables.reduce((acc, table) => {
    const section = table.location?.section || 'center';
    if (!acc[section]) acc[section] = [];
    acc[section].push(table);
    return acc;
  }, {} as Record<string, Table[]>);

  // Sort tables within each section by row and column
  Object.keys(tablesBySection).forEach((section) => {
    tablesBySection[section].sort((a, b) => {
      const rowA = a.location?.row || 0;
      const rowB = b.location?.row || 0;
      const colA = a.location?.column || 0;
      const colB = b.location?.column || 0;
      
      if (rowA !== rowB) {
        return rowA - rowB;
      }
      return colA - colB;
    });
  });

  if (!selectedDate || !selectedTime) {
    return (
      <div className="text-center py-8 text-pink-600">
        Please select date and time to view available tables
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        <p className="text-pink-600 mt-2">Loading table layout...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="bg-white/90 rounded-lg p-4 border border-pink-200">
        <h3 className="text-lg font-semibold text-pink-800 mb-3">Table Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-700">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-pink-600 rounded"></div>
            <span className="text-sm text-gray-700">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-700">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-700">Too Small</span>
          </div>
        </div>
      </div>

      {/* Table Layout by Section */}
      {Object.entries(tablesBySection).map(([section, sectionTables]) => (
        <div key={section} className="bg-white/90 rounded-lg p-6 border border-pink-200">
          <h3 className="text-xl font-semibold text-pink-800 mb-4 capitalize">
            {section} Section
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sectionTables.map((table) => {
              const status = getTableStatus(table);
              const isSelectable = status === 'available' && table.capacity >= numberOfGuests;

              return (
                <motion.button
                  key={table._id}
                  type="button"
                  disabled={!isSelectable}
                  onClick={() => isSelectable && onTableSelect(table)}
                  onMouseEnter={() => setHoveredTable(table.tableNumber)}
                  onMouseLeave={() => setHoveredTable(null)}
                  className={`
                    relative p-4 rounded-lg transition-all duration-200
                    ${getTableColor(table)}
                    ${isSelectable ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : 'cursor-not-allowed opacity-60'}
                    ${selectedTable === table.tableNumber ? 'ring-4 ring-pink-400 ring-offset-2' : ''}
                  `}
                  whileHover={isSelectable ? { scale: 1.05 } : {}}
                  whileTap={isSelectable ? { scale: 0.95 } : {}}
                >
                  <div className="text-white text-center">
                    <div className="flex justify-center mb-2">
                      {getTableIcon(table)}
                    </div>
                    <div className="font-bold text-lg">{table.tableNumber}</div>
                    <div className="text-xs mt-1 flex items-center justify-center gap-1">
                      <Users className="w-3 h-3" />
                      {table.capacity}
                    </div>
                    {status === 'booked' && (
                      <div className="text-xs mt-1 bg-red-600/50 px-2 py-1 rounded">
                        Booked
                      </div>
                    )}
                    {status === 'too-small' && (
                      <div className="text-xs mt-1 bg-yellow-600/50 px-2 py-1 rounded">
                        Max {table.capacity}
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}

      {!loading && tables.length === 0 && (
        <div className="text-center py-8 bg-yellow-50 dark:bg-amber-900/20 border border-yellow-200 dark:border-amber-700/50 rounded-lg p-6">
          <p className="font-semibold text-yellow-800 dark:text-amber-200 text-lg mb-2">No tables available for booking</p>
          <p className="text-sm text-yellow-700 dark:text-amber-200/90 mb-2">
            This restaurant has not set up table booking yet. Please contact the restaurant directly to make a reservation, or try again later.
          </p>
          <p className="text-xs text-yellow-600 dark:text-amber-300/70">
            Selected: {selectedDate} · {selectedTime}
          </p>
        </div>
      )}
      
      {!loading && tables.length > 0 && Object.keys(tablesBySection).length === 0 && (
        <div className="text-center py-8 text-pink-600">
          <p>Tables loaded but no sections found. Please check table data.</p>
        </div>
      )}
    </div>
  );
}

