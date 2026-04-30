// ─── API Service Layer ───
// Central client that connects catering-ui → CATERING-SERVER
// In production, use VITE_API_URL from environment variables
// In dev, requests to /api are proxied by Vite to http://localhost:5000

const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

// Track if we're currently refreshing to avoid multiple refresh requests
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Subscribe to token refresh
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

// Notify all subscribers when token is refreshed
function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

// Refresh access token
async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (res.ok) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

// ─── Generic helpers ───

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Important: send cookies with requests
  });

  // Handle token expiration
  if (res.status === 401) {
    const body = await res.json().catch(() => ({}));
    
    // Check if it's a token expiration error
    if ((body as { code?: string }).code === 'TOKEN_EXPIRED') {
      // Try to refresh the token
      if (!isRefreshing) {
        isRefreshing = true;
        const refreshed = await refreshAccessToken();
        isRefreshing = false;

        if (refreshed) {
          // Retry the original request
          onTokenRefreshed('refreshed');
          return request<T>(endpoint, options);
        } else {
          // Refresh failed, redirect to login
          window.location.href = '/admin/login';
          throw new ApiError('Session expired. Please login again.', 401, body);
        }
      } else {
        // Wait for the ongoing refresh to complete
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(() => {
            request<T>(endpoint, options).then(resolve).catch(reject);
          });
        });
      }
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      (body as { message?: string }).message ?? res.statusText,
      res.status,
      body
    );
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Convenience wrappers
function apiGet<T>(endpoint: string) {
  return request<T>(endpoint);
}

function apiPost<T>(endpoint: string, data: unknown) {
  return request<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

function apiPut<T>(endpoint: string, data: unknown) {
  return request<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

function apiPatch<T>(endpoint: string, data: unknown) {
  return request<T>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

function apiDelete<T>(endpoint: string) {
  return request<T>(endpoint, { method: 'DELETE' });
}

// ─── Types (match CATERING-SERVER models) ───

export interface Dish {
  id: number;
  name: string;
  description?: string;
  price?: number; // DEPRECATED - kept for backward compatibility
  category: string;
  image?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Menu {
  id: number;
  name: string;
  description?: string;
  type: string;
  isActive: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'staff' | 'customer';
  permissions?: {
    dashboard?: boolean;
    bookings?: boolean;
    dishes?: boolean;
    menus?: boolean;
    packages?: boolean;
    testimonials?: boolean;
    settings?: boolean;
    customers?: boolean;
  };
  isActive?: boolean;
}

export interface Booking {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string;
  guestCount: number;
  venue?: string;
  packageId?: number;
  packageName: string;
  tier: string;
  tierName: string;
  selectedDishes?: number[];
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  estimatedPrice?: number;
  createdAt: string;
  updatedAt: string;
  package?: Menu;
}

export interface Testimonial {
  id: number;
  customerName: string;
  customerRole?: string;
  content: string;
  rating: number;
  eventType?: string;
  image?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Package {
  id: number;
  name: string;
  description?: string;
  menuType: string;
  estimatedPrice: string;
  goodForPax: number;
  includes: string[];
  dishSelectionRules?: Record<string, number>;
  dishes?: Dish[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: number;
  businessName: string;
  tagline?: string;
  description?: string;
  logo?: string;
  email?: string;
  phone?: string;
  address?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  businessHours?: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  maintenanceMode: boolean;
  allowBookings: boolean;
  minGuestsDefault: number;
  maxGuestsDefault: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
}

// ─── Auth Service ───

export interface StaffUser {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'staff';
  permissions?: {
    dashboard?: boolean;
    bookings?: boolean;
    dishes?: boolean;
    menus?: boolean;
    packages?: boolean;
    testimonials?: boolean;
    settings?: boolean;
    customers?: boolean;
  };
  isActive: boolean;
  createdAt: string;
}

export const authService = {
  login: (email: string, password: string) =>
    apiPost<LoginResponse>('/auth/login', { email, password }),

  logout: () => apiPost<{ success: boolean; message: string }>('/auth/logout', {}),

  refresh: () =>
    apiPost<{ success: boolean; user: User }>('/auth/refresh', {}),

  verifyToken: () =>
    apiGet<{ success: boolean; user: User }>('/auth/verify'),

  getProfile: () =>
    apiGet<{ success: boolean; data: User }>('/auth/profile'),

  updateProfile: (data: { name?: string; email?: string }) =>
    apiPut<{ success: boolean; message: string; data: User }>('/auth/profile', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiPost<{ success: boolean; message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    }),
};

// ─── Dish Service ───

export const dishService = {
  getAll: () => apiGet<ApiResponse<Dish[]>>('/dishes'),

  getByCategory: (category: string) =>
    apiGet<ApiResponse<Dish[]>>(`/dishes/category/${encodeURIComponent(category)}`),

  getById: (id: number) =>
    apiGet<ApiResponse<Dish>>(`/dishes/${id}`),

  // Admin-only
  create: (dish: Partial<Dish>) =>
    apiPost<ApiResponse<Dish>>('/dishes', dish),

  update: (id: number, dish: Partial<Dish>) =>
    apiPut<ApiResponse<Dish>>(`/dishes/${id}`, dish),

  delete: (id: number) =>
    apiDelete<ApiResponse<null>>(`/dishes/${id}`),
};

// ─── Menu Service ───

export const menuService = {
  getAll: () => apiGet<ApiResponse<Menu[]>>('/menus'),

  getById: (id: number) =>
    apiGet<ApiResponse<Menu>>(`/menus/${id}`),

  // Admin-only
  create: (menu: Partial<Menu>) =>
    apiPost<ApiResponse<Menu>>('/menus', menu),

  update: (id: number, menu: Partial<Menu>) =>
    apiPut<ApiResponse<Menu>>(`/menus/${id}`, menu),

  delete: (id: number) =>
    apiDelete<ApiResponse<null>>(`/menus/${id}`)
};

// ─── Booking Service ───

export const bookingService = {
  getAll: () => apiGet<ApiResponse<Booking[]>>('/bookings'),

  getById: (id: number) =>
    apiGet<ApiResponse<Booking>>(`/bookings/${id}`),

  getByStatus: (status: string) =>
    apiGet<ApiResponse<Booking[]>>(`/bookings/status/${status}`),

  // Public - no auth required
  create: (booking: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    eventDate: string;
    guestCount: number;
    venue?: string;
    packageId?: number;
    packageName: string;
    tier: string;
    tierName: string;
    selectedDishes?: number[];
    notes?: string;
    estimatedPrice?: number;
  }) =>
    apiPost<ApiResponse<Booking>>('/bookings', booking),

  // Admin-only
  update: (id: number, booking: Partial<Booking>) =>
    apiPut<ApiResponse<Booking>>(`/bookings/${id}`, booking),

  updateStatus: (id: number, status: string) =>
    apiPatch<ApiResponse<Booking>>(`/bookings/${id}/status`, { status }),

  delete: (id: number) =>
    apiDelete<ApiResponse<null>>(`/bookings/${id}`),
};

// ─── Testimonial Service ───

export const testimonialService = {
  // Public - get active testimonials
  getAll: () => apiGet<ApiResponse<Testimonial[]>>('/testimonials'),

  // Admin - get all testimonials including inactive
  getAllAdmin: () => apiGet<ApiResponse<Testimonial[]>>('/testimonials/admin/all'),

  getById: (id: number) =>
    apiGet<ApiResponse<Testimonial>>(`/testimonials/${id}`),

  create: (testimonial: Partial<Testimonial>) =>
    apiPost<ApiResponse<Testimonial>>('/testimonials', testimonial),

  update: (id: number, testimonial: Partial<Testimonial>) =>
    apiPut<ApiResponse<Testimonial>>(`/testimonials/${id}`, testimonial),

  delete: (id: number) =>
    apiDelete<ApiResponse<null>>(`/testimonials/${id}`),
};

// ─── Package Service ───

export const packageService = {
  // Public - get active packages
  getAll: () => apiGet<ApiResponse<Package[]>>('/packages'),

  getByMenuType: (menuType: string) =>
    apiGet<ApiResponse<Package[]>>(`/packages/menu-type/${menuType}`),

  // Admin - get all packages including inactive
  getAllAdmin: () => apiGet<ApiResponse<Package[]>>('/packages/admin/all'),

  getById: (id: number) =>
    apiGet<ApiResponse<Package>>(`/packages/${id}`),

  create: (pkg: Partial<Package>) =>
    apiPost<ApiResponse<Package>>('/packages', pkg),

  update: (id: number, pkg: Partial<Package>) =>
    apiPut<ApiResponse<Package>>(`/packages/${id}`, pkg),

  delete: (id: number) =>
    apiDelete<ApiResponse<null>>(`/packages/${id}`),
};

// ─── Upload Service ───

export const uploadService = {
  uploadImage: async (file: File): Promise<ApiResponse<{ filename: string; path: string; size: number; mimetype: string }>> => {
    const token = localStorage.getItem('auth_token');
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE}/upload/image`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
      credentials: 'include',
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(
        (body as { message?: string }).message ?? res.statusText,
        res.status,
        body
      );
    }

    return res.json();
  },

  uploadImages: async (files: File[]): Promise<ApiResponse<Array<{ filename: string; path: string; size: number; mimetype: string }>>> => {
    const token = localStorage.getItem('auth_token');
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    const res = await fetch(`${API_BASE}/upload/images`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
      credentials: 'include',
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(
        (body as { message?: string }).message ?? res.statusText,
        res.status,
        body
      );
    }

    return res.json();
  },
};

// ─── Settings Service ───

export const settingsService = {
  // Public - get settings
  get: () => apiGet<ApiResponse<Settings>>('/settings'),

  // Admin - update settings
  update: (settings: Partial<Settings>) =>
    apiPut<ApiResponse<Settings>>('/settings', settings),
};

// ─── Analytics Service ───

export interface DashboardStats {
  overview: {
    totalBookings: number;
    totalRevenue: number;
    avgBookingValue: number;
    pendingBookings: number;
    totalCustomers: number;
  };
  bookingsByStatus: Array<{ status: string; count: number }>;
  popularPackages: Array<{ name: string; count: number }>;
  monthlyTrend: Array<{ month: string; bookings: number; revenue: number }>;
  guestDistribution: Array<{ range: string; count: number }>;
  recentBookings: Booking[];
}

export interface RevenueData {
  period: string;
  revenue: number;
  bookings: number;
  avgValue: number;
}

export interface PackagePerformance {
  packageName: string;
  tierName: string;
  bookings: number;
  revenue: number;
  avgGuests: number;
}

export const analyticsService = {
  getDashboardStats: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return apiGet<ApiResponse<DashboardStats>>(`/analytics/dashboard?${params}`);
  },

  getRevenueAnalytics: (period: 'day' | 'week' | 'month' | 'year' = 'month') =>
    apiGet<ApiResponse<RevenueData[]>>(`/analytics/revenue?period=${period}`),

  getPackagePerformance: () =>
    apiGet<ApiResponse<PackagePerformance[]>>('/analytics/packages'),
};
