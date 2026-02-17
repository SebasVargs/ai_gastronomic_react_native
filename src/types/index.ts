// src/types/index.ts

export interface User {
  id: string;
  nombre: string;
  edad: number;
  origen: string;
  email?: string;
  preferencias: string[];
  historial_pedidos?: any[];
  fecha_registro?: string;
  activo?: boolean;
}

export interface Restaurant {
  id: string; // Changed from number to string
  nombre: string;
  direccion: string;
  tipo_cocina: string;
  rating?: number;
  imagen_url?: string;
}

export interface Plate {
  id: string; // Changed from number to string
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  restaurante_id: string; // Changed from number to string
  ingredientes?: string[];
  calorias?: number;
  imagen_url?: string;
}

export interface Review {
  id: string; // Changed from number to string
  usuario_id: string; // Changed from number to string
  plato_id: string; // Changed from number to string
  rating: number;
  comentario: string;
  fecha: string;
}

export interface RecommendationRequest {
  user_id: string;
  tipo_recomendacion: 'restaurantes' | 'platos';
  limite?: number;
  incluir_ubicacion?: boolean;
  latitud?: number;
  longitud?: number;
  radio_km?: number;
  // Nuevos filtros
  precio_min?: number;
  precio_max?: number;
  categoria?: string;
  rating_minimo?: number;
  abierto_ahora?: boolean;
  dia_semana?: number;
  hora?: number;
  popularidad_minima?: number;
  confianza_minima?: number;
  excluir_categorias?: string[];
}

export interface Recommendation {
  id: string;
  nombre_plato: string;
  categoria_plato: string;
  precio: number;
  predicted_rating: number;
  ml_confidence: number;
  restaurante_id?: string;
  descripcion?: string;
  // Campos opcionales para compatibilidad UI
  nombre?: string;
  restaurante?: string;
  rating_predicho?: number;
  confianza?: number;
}

export interface RecommendationResponse {
  tipo: string;
  user_id: string;
  criterios_usados: string[];
  total_disponibles: number;
  recomendaciones: Recommendation[];
  modelo_usado: boolean;
}

export interface ModelPerformance {
  model_status: {
    random_forest_trained: boolean;
    kmeans_fitted: boolean;
    synthetic_data_records: number;
  };
  random_forest?: {
    mae: number;
    rmse: number;
    r2: number;
  };
  feature_importance?: Record<string, number>;
  training_time?: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DashboardMetrics {
  totalUsers: number;
  syntheticData: number;
  modelAccuracy: string;
  recommendationsGenerated: number;
}
