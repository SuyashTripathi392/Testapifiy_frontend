import axios from 'axios';
import { supabase } from '../config/supabase';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Axios instance create kare with base config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});


// Request interceptor for auth
apiClient.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      // Auto logout if unauthorized
      supabase.auth.signOut();
    }
    
    return Promise.reject(error);
  }
);

export const apiService = {
  // Proxy request
  proxyRequest: async (requestData) => {
    try {
      const response = await apiClient.post('/proxy', requestData);
      return response.data;
    } catch (error) {
      throw {
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  },

  // Save to history
  saveToHistory: async (historyData) => {
    try {
      const response = await apiClient.post('/history/save', historyData);
      return response.data;
    } catch (error) {
      throw {
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  },

  // Get history
  getHistory: async (limit = 50) => {
    try {
      const response = await apiClient.get('/history', { params: { limit } });
      return response.data;
    } catch (error) {
      throw {
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  },

  // Clear history
  clearHistory: async () => {
    try {
      const response = await apiClient.delete('/history');
      return response.data;
    } catch (error) {
      throw {
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  },

  // Delete history item
  deleteHistoryItem: async (id) => {
    try {
      const response = await apiClient.delete(`/history/${id}`);
      return response.data;
    } catch (error) {
      throw {
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  },

  // Create collection
  createCollection: async (collectionData) => {
    try {
      const response = await apiClient.post('/collections/create', collectionData);
      return response.data;
    } catch (error) {
      throw {
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  },

  // Get collections
  getCollections: async () => {
    try {
      const response = await apiClient.get('/collections');
      return response.data;
    } catch (error) {
      throw {
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  },

  // Get single collection
  getCollection: async (id) => {
    try {
      const response = await apiClient.get(`/collections/${id}`);
      return response.data;
    } catch (error) {
      throw {
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  },

  // Update collection
  updateCollection: async (id, collectionData) => {
    try {
      const response = await apiClient.put(`/collections/${id}`, collectionData);
      return response.data;
    } catch (error) {
      throw {
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  },

  // Delete collection
  deleteCollection: async (id) => {
    try {
      const response = await apiClient.delete(`/collections/${id}`);
      return response.data;
    } catch (error) {
      throw {
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  },

  // Add to collection
  addToCollection: async (itemData) => {
    try {
      const response = await apiClient.post('/collections/add-item', itemData);
      return response.data;
    } catch (error) {
      throw {
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  },

  // Update collection item
  updateCollectionItem: async (id, itemData) => {
    try {
      const response = await apiClient.put(`/collections/items/${id}`, itemData);
      return response.data;
    } catch (error) {
      throw {
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  },

  // Delete collection item
  deleteCollectionItem: async (id) => {
    try {
      const response = await apiClient.delete(`/collections/items/${id}`);
      return response.data;
    } catch (error) {
      throw {
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  }
};