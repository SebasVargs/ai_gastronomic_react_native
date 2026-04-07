// src/services/api.ts
import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import type {
  User,
  Restaurant,
  Plate,
  Review,
  ModelPerformance,
  APIResponse,
  RecommendationRequest,
  RecommendationResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class APIClient {
  private client: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private async handleRequest<T>(request: Promise<any>): Promise<APIResponse<T>> {
    try {
      const response = await request;
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.code === 'ECONNREFUSED') {
          return {
            success: false,
            error: 'No se puede conectar al servidor. ¿Está corriendo la API en localhost:8000?',
          };
        }
        if (axiosError.code === 'ECONNABORTED') {
          return {
            success: false,
            error: 'Timeout - La petición tardó demasiado',
          };
        }
        return {
          success: false,
          error: `Error ${axiosError.response?.status}: ${axiosError.message}`,
        };
      }
      return {
        success: false,
        error: `Error inesperado: ${(error as Error).message}`,
      };
    }
  }

  // Health check
  async checkHealth(): Promise<APIResponse<any>> {
    return this.handleRequest(this.client.get('/health'));
  }

  // Users
  async getUsers(): Promise<APIResponse<User[]>> {
    return this.handleRequest(this.client.get('/api/users/'));
  }

  async createUser(userData: Partial<User>): Promise<APIResponse<User>> {
    return this.handleRequest(this.client.post('/api/users/', userData));
  }

  async getUserById(id: number): Promise<APIResponse<User>> {
    return this.handleRequest(this.client.get(`/api/users/${id}`)); // ID endpoint usually doesn't need trailing slash if path param is valid, but let's check router.
  }

  // Restaurants
  async getRestaurants(): Promise<APIResponse<Restaurant[]>> {
    return this.handleRequest(this.client.get('/api/restaurants/'));
  }

  async createRestaurant(restaurantData: Partial<Restaurant>): Promise<APIResponse<Restaurant>> {
    return this.handleRequest(this.client.post('/api/restaurants/', restaurantData));
  }

  // Plates
  async getPlates(): Promise<APIResponse<Plate[]>> {
    return this.handleRequest(this.client.get('/api/plates/'));
  }

  async createPlate(plateData: Partial<Plate>): Promise<APIResponse<Plate>> {
    return this.handleRequest(this.client.post('/api/plates/', plateData));
  }

  // Reviews
  async getReviews(): Promise<APIResponse<Review[]>> {
    return this.handleRequest(this.client.get('/api/reviews/'));
  }

  async createReview(reviewData: Partial<Review>): Promise<APIResponse<Review>> {
    return this.handleRequest(this.client.post('/api/reviews/', reviewData));
  }

  // AI Recommendations
  async getRecommendations(request: RecommendationRequest): Promise<APIResponse<RecommendationResponse>> {
    console.log('🚀 Sending POST request to /api/ai/recommendations', request);
    return this.handleRequest(
      this.client.post('/api/ai/recommendations/', request) // Also check this one
    );
  }

  async trainModel(): Promise<APIResponse<any>> {
    return this.handleRequest(this.client.post('/api/ai/train-with-synthetic-data/'));
  }

  async getModelPerformance(): Promise<APIResponse<ModelPerformance>> {
    return this.handleRequest(this.client.get('/api/ai/model-performance/'));
  }

  // Categories from CSV
  async getCategories(): Promise<APIResponse<string[]>> {
    return this.handleRequest(this.client.get('/api/ai/categories'));
  }

  async getPlatesByRestaurant(restaurantId: string): Promise<APIResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/restaurants/${restaurantId}/plates`);
      const data = await response.json();
      if (data.success) {
        return { success: true, data: data.data };
      }
      return { success: false, error: data.detail || 'Error obteniendo platos' };
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    }
  }
}

export const apiClient = new APIClient();
export default apiClient;
