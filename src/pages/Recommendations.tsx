// src/pages/Recommendations.tsx

import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { RecommendationCard } from '../components/RecommendationCard';
import apiClient from '../services/api';
import type { User, Recommendation, RecommendationRequest } from '../types';
import './Recommendations.css';

export const Recommendations: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [numRecommendations, setNumRecommendations] = useState(5);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [openNow, setOpenNow] = useState<boolean>(false);
  const [tipoRecomendacion, setTipoRecomendacion] = useState<'platos' | 'restaurantes'>('platos');

  useEffect(() => {
    loadUsers();
    loadCategories();
  }, []);

  const loadUsers = async () => {
    setLoadingUsers(true);
    setError(null);
    try {
      const response = await apiClient.getUsers();
      if (response.success && Array.isArray(response.data)) {
        setUsers(response.data);
        if (response.data.length > 0 && !selectedUser) {
          setSelectedUser(response.data[0]);
        }
      } else {
        setError(response.error || 'Error cargando usuarios. Verifica que el backend esté corriendo.');
      }
    } catch (err) {
      setError('Error inesperado al cargar usuarios');
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadCategories = async () => {
    const response = await apiClient.getCategories();
    if (response.success && response.data) {
      setCategories(response.data);
    }
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat)
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  };

  const generateRecommendations = async () => {
    if (!selectedUser) return;

    setLoading(true);
    setError(null);

    const request: RecommendationRequest = {
      user_id: String(selectedUser.id),
      tipo_recomendacion: tipoRecomendacion,
      limite: numRecommendations,
      precio_min: minPrice ? Number(minPrice) : undefined,
      precio_max: maxPrice ? Number(maxPrice) : undefined,
      categoria: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
      rating_minimo: minRating > 0 ? minRating : undefined,
      abierto_ahora: openNow,
      incluir_ubicacion: false
    };

    try {
      const response = await apiClient.getRecommendations(request);

      if (response.success && response.data) {
        const mappedRecommendations = response.data.recomendaciones.map((rec: any) => ({
          ...rec,
          plato_id: rec.id || rec._id,
          nombre: rec.nombre_plato,
          rating_predicho: rec.predicted_rating,
          confianza: rec.ml_confidence,
          restaurante: rec.restaurante_id || 'Restaurante Desconocido'
        }));
        setRecommendations(mappedRecommendations);
        localStorage.setItem('last_recommendations', JSON.stringify(mappedRecommendations));

        if (mappedRecommendations.length === 0) {
          setError('No se encontraron recomendaciones con los filtros actuales.');
        }
      } else {
        setError(response.error || 'Error generando recomendaciones');
      }
    } catch (err) {
      setError('Error inesperado al generar recomendaciones');
    } finally {
      setLoading(false);
    }
  };

  if (loadingUsers) {
    return (
      <div className="recommendations">
        <div className="loading-state">
          <Loader2 size={48} className="spinner" />
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations">
      <div className="recommendations-header animate-fadeIn">
        <div>
          <h1>Recomendaciones IA</h1>
          <p>Obtén recomendaciones personalizadas basadas en inteligencia artificial</p>
        </div>
      </div>

      <div className="recommendations-config animate-fadeIn stagger-1">
        <div className="config-card">
          <h3>Configuración de Recomendaciones</h3>

          <div className="filters-grid">
            <div className="form-group">
              <label htmlFor="user-select">Usuario</label>
              <select
                id="user-select"
                value={selectedUser?.id || ''}
                onChange={(e) => {
                  const user = users.find(u => u.id === e.target.value);
                  setSelectedUser(user || null);
                }}
                className="select-input"
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Rango de Precio ($)</label>
              <div className="price-range-row">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="text-input price-input"
                />
                <span className="price-separator">–</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="text-input price-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Rating Mínimo ({minRating}★)</label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="range-input"
              />
            </div>

            <div className="form-group">
              <label>Configuración Adicional</label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={openNow}
                  onChange={(e) => setOpenNow(e.target.checked)}
                />
                Solo Abiertos Ahora
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>
              Categorías{' '}
              <span className="label-hint">({selectedCategories.length} seleccionadas)</span>
            </label>
            <div className="categories-chip-grid">
              {categories.map(cat => (
                <label
                  key={cat}
                  className={`category-chip ${selectedCategories.includes(cat) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    style={{ display: 'none' }}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="num-recommendations">
              Número de Recomendaciones: <strong>{numRecommendations}</strong>
            </label>
            <input
              id="num-recommendations"
              type="range"
              min="1"
              max="20"
              value={numRecommendations}
              onChange={(e) => setNumRecommendations(Number(e.target.value))}
              className="range-input"
            />
            <div className="range-labels">
              <span>1</span>
              <span>20</span>
            </div>
          </div>

          <Button
            onClick={generateRecommendations}
            loading={loading}
            icon={<Sparkles size={20} />}
            size="lg"
            disabled={!selectedUser}
          >
            Generar Recomendaciones
          </Button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error animate-fadeIn">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="recommendations-results">
          <div className="results-header animate-fadeIn">
            <h2>Recomendaciones para {selectedUser?.nombre}</h2>
            <p>
              Hemos encontrado <strong>{recommendations.length}</strong> platos que podrían
              interesarte
            </p>
          </div>

          <div className="recommendations-grid">
            {recommendations.map((rec, index) => (
              <div
                key={rec.id}
                className={`animate-fadeIn stagger-${Math.min(index + 1, 5)}`}
              >
                <RecommendationCard recommendation={rec} rank={index + 1} />
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && recommendations.length === 0 && !error && (
        <div className="empty-recommendations animate-fadeIn">
          <Sparkles size={64} className="empty-icon" />
          <h3>Listo para generar recomendaciones</h3>
          <p>
            Selecciona un usuario y haz clic en "Generar Recomendaciones" para comenzar
          </p>
        </div>
      )}
    </div>
  );
};
