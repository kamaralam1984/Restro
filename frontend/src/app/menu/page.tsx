'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, ChefHat, Filter, Sparkles, ArrowUpDown, X, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import EnhancedMenuCard from '@/components/EnhancedMenuCard';
import { menuService, MenuItem, MenuCategory, MenuFilters } from '@/services/menu.service';
import { useLanguage } from '@/context/LanguageContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useRestaurantPage } from '@/context/RestaurantPageContext';
import api from '@/services/api';
import ServiceSuspendedMessage from '@/components/ServiceSuspendedMessage';

function MenuPageContent() {
  const searchParams = useSearchParams();
  const restaurantSlug = searchParams.get('restaurant') || undefined;
  const { t } = useLanguage();
  const { setRestaurant } = useRestaurantPage();
  const [restaurantSuspended, setRestaurantSuspended] = useState<boolean | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [restaurantLogo, setRestaurantLogo] = useState<string | undefined>(undefined);
  const [restaurantPrimaryColor, setRestaurantPrimaryColor] = useState<string>('#ea580c');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000 });
  const [filters, setFilters] = useState<MenuFilters>({
    category: 'all',
    isVeg: 'all',
    available: true,
    search: '',
    minPrice: undefined,
    maxPrice: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 12,
    restaurant: restaurantSlug,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce search term
  const debouncedSearch = useDebounce(searchTerm, 500);

  // When viewing a specific restaurant, fetch details and set context for navbar branding
  useEffect(() => {
    if (!restaurantSlug) {
      setRestaurantSuspended(null);
      setRestaurantName('');
      setRestaurantLogo(undefined);
      setRestaurant(null);
      return;
    }
    api
      .get<{ status?: string; subscriptionStatus?: string; name?: string; logo?: string; primaryColor?: string }>(`/restaurants/by-slug/${restaurantSlug}`)
      .then((r) => {
        const suspended =
          r.status === 'inactive' ||
          r.subscriptionStatus === 'suspended' ||
          r.subscriptionStatus === 'cancelled';
        setRestaurantSuspended(suspended);
        setRestaurantName(r.name || '');
        setRestaurantLogo(r.logo);
        setRestaurantPrimaryColor(r.primaryColor || '#ea580c');
        setRestaurant({
          slug: restaurantSlug,
          name: r.name || restaurantSlug,
          logo: r.logo,
          primaryColor: r.primaryColor,
        });
      })
      .catch(() => {
        setRestaurantSuspended(false);
        setRestaurant(null);
      });
  }, [restaurantSlug, setRestaurant]);

  useEffect(() => {
    if (restaurantName && restaurantSlug) {
      document.title = `${restaurantName} - Menu | Restro OS`;
    } else {
      document.title = 'Our Menu | Restro OS';
    }
    return () => { document.title = 'Restro OS'; };
  }, [restaurantName, restaurantSlug]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Sync restaurant slug from URL into filters
  useEffect(() => {
    if (restaurantSlug !== undefined) {
      setFilters((prev) => (prev.restaurant === restaurantSlug ? prev : { ...prev, restaurant: restaurantSlug, page: 1 }));
    }
  }, [restaurantSlug]);

  // Load menu when filters change
  useEffect(() => {
    loadMenu();
  }, [filters.category, filters.isVeg, filters.minPrice, filters.maxPrice, filters.sortBy, filters.sortOrder, filters.page, filters.restaurant, debouncedSearch]);

  // Update search filter when debounced search changes
  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  const loadInitialData = async () => {
    try {
      const [cats, priceRangeData] = await Promise.all([
        menuService.getCategories(restaurantSlug || undefined),
        menuService.getPriceRange(restaurantSlug || undefined),
      ]);
      setCategories(cats);
      setPriceRange(priceRangeData);
      setFilters((prev) => ({
        ...prev,
        minPrice: priceRangeData.min,
        maxPrice: priceRangeData.max,
      }));
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const loadMenu = async () => {
    try {
      setLoading(true);
      const response = await menuService.getMenuItems(filters);
      setMenuItems(response.items);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load menu:', error);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setFilters((prev) => ({ ...prev, category, page: 1 }));
  };

  const handleVegFilterChange = (isVeg: 'all' | 'veg' | 'nonveg') => {
    setFilters((prev) => ({ ...prev, isVeg, page: 1 }));
  };

  const handleSortChange = (sortBy: 'name' | 'price' | 'createdAt' | 'category' | 'preparationTime') => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handlePriceRangeChange = (min: number | undefined, max: number | undefined) => {
    setFilters((prev) => ({ ...prev, minPrice: min, maxPrice: max, page: 1 }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      category: 'all',
      isVeg: 'all',
      available: true,
      search: '',
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 12,
    });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (restaurantSlug && restaurantSuspended === true) {
    return (
      <div className="min-h-screen bg-slate-950">
        <ServiceSuspendedMessage restaurantName={restaurantName} subscriptionExpired />
      </div>
    );
  }

  if (loading && menuItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading menu...</p>
        </div>
      </div>
    );
  }

  const primaryColor = restaurantPrimaryColor || '#ea580c';

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section — restaurant logo/name when ?restaurant= */}
      <section className="relative py-16 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {restaurantSlug && restaurantName && (
              <div className="mb-6">
                <Link href={`/r/${restaurantSlug}`} className="inline-flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                  {restaurantLogo ? (
                    <Image src={restaurantLogo} alt={restaurantName} width={56} height={56} className="rounded-xl object-cover" unoptimized />
                  ) : (
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center border-2" style={{ backgroundColor: `${primaryColor}25`, borderColor: `${primaryColor}50` }}>
                      <Store className="w-7 h-7" style={{ color: primaryColor }} />
                    </div>
                  )}
                  <span className="text-xl font-semibold text-white">{restaurantName}</span>
                </Link>
              </div>
            )}
            <div className="flex items-center justify-center gap-3 mb-4">
              <ChefHat className="w-12 h-12" style={{ color: primaryColor }} />
              <h1 className="text-5xl md:text-6xl font-bold">
                Our <span style={{ color: primaryColor }}>Menu</span>
              </h1>
            </div>
            <p className="text-xl text-slate-300 mb-8">
              Discover our delicious selection of dishes, crafted with love and the finest ingredients
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for dishes, ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Filters Section */}
        <motion.div
          className="mb-8 bg-slate-900 rounded-xl p-6 border border-slate-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-orange-600" />
              <h2 className="text-xl font-semibold">Filters</h2>
            </div>
            {(filters.category !== 'all' || filters.isVeg !== 'all' || filters.search || filters.minPrice !== priceRange.min || filters.maxPrice !== priceRange.max) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-orange-600 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Category</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filters.category === 'all'
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  All
                </button>
                {categories.length > 0 ? (
                  categories.map((cat) => {
                    // Format category name for display
                    const displayName = cat.name
                      .split(' ')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ');
                    
                    return (
                      <button
                        key={cat.name}
                        onClick={() => handleCategoryChange(cat.name)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          filters.category === cat.name
                            ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/50'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 hover:border-orange-600/50'
                        }`}
                      >
                        {displayName} <span className="text-xs opacity-75">({cat.count})</span>
                      </button>
                    );
                  })
                ) : (
                  ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Soup'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat.toLowerCase())}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filters.category === cat.toLowerCase()
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Veg/Non-Veg Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleVegFilterChange('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filters.isVeg === 'all'
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleVegFilterChange('veg')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    filters.isVeg === 'veg'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  {t('veg')}
                </button>
                <button
                  onClick={() => handleVegFilterChange('nonveg')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    filters.isVeg === 'nonveg'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  {t('nonVeg')}
                </button>
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Price Range: ₹{filters.minPrice || priceRange.min} - ₹{filters.maxPrice || priceRange.max}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Min Price</label>
                  <input
                    type="number"
                    min={priceRange.min}
                    max={priceRange.max}
                    value={filters.minPrice || priceRange.min}
                    onChange={(e) => handlePriceRangeChange(Number(e.target.value), filters.maxPrice)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Max Price</label>
                  <input
                    type="number"
                    min={priceRange.min}
                    max={priceRange.max}
                    value={filters.maxPrice || priceRange.max}
                    onChange={(e) => handlePriceRangeChange(filters.minPrice, Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" />
                Sort By
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'name', label: 'Name' },
                  { value: 'price', label: 'Price' },
                  { value: 'createdAt', label: 'Newest' },
                  { value: 'category', label: 'Category' },
                ].map((sort) => (
                  <button
                    key={sort.value}
                    onClick={() => handleSortChange(sort.value as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      filters.sortBy === sort.value
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {sort.label}
                    {filters.sortBy === sort.value && (
                      <span className="text-xs">
                        {filters.sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        {!loading && menuItems.length > 0 && (
          <motion.div
            className="mb-6 text-slate-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Showing <span className="text-orange-600 font-semibold">{pagination.totalItems}</span> item{pagination.totalItems !== 1 ? 's' : ''}
            {filters.search && ` for "${filters.search}"`}
          </motion.div>
        )}

        {/* Menu Items Grid */}
        {loading && menuItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading menu items...</p>
          </div>
        ) : menuItems.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChefHat className="w-12 h-12 text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No items found</h3>
              <p className="text-slate-400 mb-6">
                {filters.search || filters.category !== 'all' || filters.isVeg !== 'all'
                  ? 'Try adjusting your filters or search term'
                  : 'Menu items will appear here once added'}
              </p>
              {(filters.search || filters.category !== 'all' || filters.isVeg !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item, index) => (
                <EnhancedMenuCard key={item._id || item.id} item={item} index={index} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    pagination.hasPrevPage
                      ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                      : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          pagination.currentPage === pageNum
                            ? 'bg-orange-600 text-white'
                            : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    pagination.hasNextPage
                      ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                      : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Featured Section */}
        {!loading && menuItems.length > 0 && (
          <motion.section
            className="mt-16 bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl p-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-white" />
              <h2 className="text-3xl font-bold text-white">Special Offers</h2>
            </div>
            <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
              Order 3 or more items and get 10% off! Use code <span className="font-bold">SILVER10</span> at checkout.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-orange-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                Free delivery on orders above ₹500
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                Hot & fresh food guaranteed
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                30 minutes delivery
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent" />
      </div>
    }>
      <MenuPageContent />
    </Suspense>
  );
}
