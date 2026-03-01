import api from './api';

export interface MenuItem {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  available: boolean;
  isVeg: boolean;
  addOns?: { name: string; price: number; available: boolean }[];
  ingredients?: string[];
  allergens?: string[];
  preparationTime?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuCategory {
  name: string;
  count: number;
}

export interface MenuFilters {
  category?: string;
  isVeg?: 'all' | 'veg' | 'nonveg';
  available?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'createdAt' | 'category' | 'preparationTime';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface MenuResponse {
  items: MenuItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    category: string;
    isVeg: string;
    available: boolean;
    search: string;
    priceRange: {
      min: number | null;
      max: number | null;
    };
  };
}

export interface PriceRange {
  min: number;
  max: number;
}

export const menuService = {
  async getMenuItems(filters?: MenuFilters): Promise<MenuResponse> {
    const params: any = {};
    
    if (filters?.category && filters.category !== 'all') {
      params.category = filters.category;
    }
    
    if (filters?.isVeg && filters.isVeg !== 'all') {
      params.isVeg = filters.isVeg === 'veg' ? 'true' : 'false';
    }
    
    if (filters?.available !== undefined) {
      params.available = filters.available.toString();
    }
    
    if (filters?.search) {
      params.search = filters.search;
    }
    
    if (filters?.minPrice !== undefined) {
      params.minPrice = filters.minPrice.toString();
    }
    
    if (filters?.maxPrice !== undefined) {
      params.maxPrice = filters.maxPrice.toString();
    }
    
    if (filters?.sortBy) {
      params.sortBy = filters.sortBy;
    }
    
    if (filters?.sortOrder) {
      params.sortOrder = filters.sortOrder;
    }
    
    if (filters?.page) {
      params.page = filters.page.toString();
    }
    
    if (filters?.limit) {
      params.limit = filters.limit.toString();
    }

    return api.get<MenuResponse>('/menu', { params });
  },

  async getMenuItem(id: string): Promise<MenuItem> {
    return api.get<MenuItem>(`/menu/${id}`);
  },

  async getMenuByCategory(category: string, filters?: Omit<MenuFilters, 'category'>): Promise<MenuResponse> {
    return this.getMenuItems({ ...filters, category });
  },

  async getCategories(): Promise<MenuCategory[]> {
    return api.get<MenuCategory[]>('/menu/categories');
  },

  async getPriceRange(): Promise<PriceRange> {
    return api.get<PriceRange>('/menu/price-range');
  },

  // Advanced search with multiple criteria
  async searchMenuItems(query: string, filters?: Omit<MenuFilters, 'search'>): Promise<MenuResponse> {
    return this.getMenuItems({ ...filters, search: query });
  },

  // Get items by price range
  async getMenuByPriceRange(minPrice: number, maxPrice: number, filters?: Omit<MenuFilters, 'minPrice' | 'maxPrice'>): Promise<MenuResponse> {
    return this.getMenuItems({ ...filters, minPrice, maxPrice });
  },
};

