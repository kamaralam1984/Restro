import api from './api';

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  price: number;
  addOns?: { name: string; price: number }[];
  customizations?: string;
}

export interface Order {
  id?: string;
  orderNumber?: string;
  items: OrderItem[];
  total: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  tableNumber?: string;
  notes?: string;
  paymentMethod?: 'cash' | 'card' | 'online';
  status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt?: string;
}

export interface Booking {
  id?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  bookingHours?: number;
  numberOfGuests: number;
  specialRequests?: string;
  tableNumber?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
}

export const orderService = {
  async createOrder(order: Order): Promise<Order> {
    return api.post<Order>('/orders', order);
  },

  async getOrder(id: string): Promise<Order> {
    return api.get<Order>(`/orders/${id}`);
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    return api.put<Order>(`/orders/${id}/status`, { status });
  },

  async createBooking(booking: Booking): Promise<Booking> {
    return api.post<Booking>('/bookings', booking);
  },

  async getBooking(id: string): Promise<Booking> {
    return api.get<Booking>(`/bookings/${id}`);
  },
};

