// Detecta ambiente e define a base da API corretamente
const API_BASE_URL =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api'
    : '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }
    
    return data;
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });
    
    return this.handleResponse(response);
  }

  async register(username: string, email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ username, email, password }),
    });
    
    return this.handleResponse(response);
  }

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse(response);
  }

  // Addon endpoints
  async getAddons(params?: {
    search?: string;
    category?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
    featured?: boolean;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/addons?${searchParams}`, {
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse(response);
  }

  async getAddon(id: string) {
    const response = await fetch(`${API_BASE_URL}/addons/${id}`, {
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse(response);
  }

  async createAddon(addonData: {
    title: string;
    description: string;
    category: string;
    version?: string;
    images: string[];
    downloadLinks: Array<{ name: string; url: string; platform?: string }>;
  }) {
    const response = await fetch(`${API_BASE_URL}/addons`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(addonData),
    });
    
    return this.handleResponse(response);
  }

  async updateAddon(id: string, addonData: Partial<{
    title: string;
    description: string;
    category: string;
    version: string;
    images: string[];
    downloadLinks: Array<{ name: string; url: string; platform?: string }>;
  }>) {
    const response = await fetch(`${API_BASE_URL}/addons/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(addonData),
    });
    
    return this.handleResponse(response);
  }

  async deleteAddon(id: string) {
    const response = await fetch(`${API_BASE_URL}/addons/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse(response);
  }

  async incrementViews(id: string) {
    const response = await fetch(`${API_BASE_URL}/addons/${id}/views`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse(response);
  }

  async incrementDownloads(id: string) {
    const response = await fetch(`${API_BASE_URL}/addons/${id}/downloads`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse(response);
  }

  // User endpoints
  async getUser(id: string) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse(response);
  }

  async getUserAddons(id: string, params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/users/${id}/addons?${searchParams}`, {
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse(response);
  }

  async updateProfile(id: string, profileData: {
    username?: string;
    avatarUrl?: string;
    bio?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();