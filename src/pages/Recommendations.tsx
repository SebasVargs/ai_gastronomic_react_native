// src/pages/Recommendations.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Loader2, AlertCircle, SlidersHorizontal, X } from 'lucide-react';
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

  // ── Request config filters ─────────────────────────────────────────────────
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [openNow, setOpenNow] = useState<boolean>(false);
  const [tipoRecomendacion, _setTipoRecomendacion] = useState<'platos' | 'restaurantes'>('platos');

  // ── Result filters (client-side) ───────────────────────────────────────────
  const [showResultFilters, setShowResultFilters] = useState(false);
  const [filterRating, setFilterRating] = useState<number>(0);
  const [filterConfianza, setFilterConfianza] = useState<number>(0);
  const [filterPrecioMin, setFilterPrecioMin] = useState<string>('');
  const [filterPrecioMax, setFilterPrecioMax] = useState<string>('');
  const [filterCategorias, setFilterCategorias] = useState<string[]>([]);
  const [filterRestaurante, setFilterRestaurante] = useState<string>('');

  const resultCategories = useMemo(() => {
    const cats = recommendations.map(r => r.categoria_plato).filter(Boolean);
    return Array.from(new Set(cats)) as string[];
  }, [recommendations]);

  const resultRestaurantes = useMemo(() => {
    const rests = recommendations.map(r => r.restaurante).filter(Boolean);
    return Array.from(new Set(rests)) as string[];
  }, [recommendations]);

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => {
      if (filterRating > 0 && rec.predicted_rating < filterRating) return false;
      if (filterConfianza > 0 && rec.ml_confidence * 100 < filterConfianza) return false;
      if (filterPrecioMin !== '' && rec.precio < Number(filterPrecioMin)) return false;
      if (filterPrecioMax !== '' && rec.precio > Number(filterPrecioMax)) return false;
      if (filterCategorias.length > 0 && !filterCategorias.includes(rec.categoria_plato)) return false;
      if (filterRestaurante !== '' && rec.restaurante !== filterRestaurante) return false;
      return true;
    });
  }, [recommendations, filterRating, filterConfianza, filterPrecioMin, filterPrecioMax, filterCategorias, filterRestaurante]);

  const activeFilterCount = [
    filterRating > 0,
    filterConfianza > 0,
    filterPrecioMin !== '',
    filterPrecioMax !== '',
    filterCategorias.length > 0,
    filterRestaurante !== '',
  ].filter(Boolean).length;

  const resetResultFilters = () => {
    setFilterRating(0);
    setFilterConfianza(0);
    setFilterPrecioMin('');
    setFilterPrecioMax('');
    setFilterCategorias([]);
    setFilterRestaurante('');
  };

  const toggleResultCategory = (cat: string) => {
    setFilterCategorias(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

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
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const generateRecommendations = async () => {
    if (!selectedUser) return;
    setLoading(true);
    setError(null);
    resetResultFilters();

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
                  <option key={user.id} value={user.id}>{user.nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Rango de Precio ($)</label>
              <div className="price-range-row">
                <input type="number" placeholder="Min" value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)} className="text-input price-input" />
                <span className="price-separator">–</span>
                <input type="number" placeholder="Max" value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)} className="text-input price-input" />
              </div>
            </div>

            <div className="form-group">
              <label>Rating Mínimo ({minRating}★)</label>
              <input type="range" min="0" max="5" step="0.5" value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))} className="range-input" />
            </div>

            <div className="form-group">
              <label>Configuración Adicional</label>
              <label className="checkbox-label">
                <input type="checkbox" checked={openNow}
                  onChange={(e) => setOpenNow(e.target.checked)} />
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
                <label key={cat}
                  className={`category-chip ${selectedCategories.includes(cat) ? 'selected' : ''}`}>
                  <input type="checkbox" checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)} style={{ display: 'none' }} />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="num-recommendations">
              Número de Recomendaciones: <strong>{numRecommendations}</strong>
            </label>
            <input id="num-recommendations" type="range" min="1" max="20"
              value={numRecommendations}
              onChange={(e) => setNumRecommendations(Number(e.target.value))}
              className="range-input" />
            <div className="range-labels"><span>1</span><span>20</span></div>
          </div>

          <Button onClick={generateRecommendations} loading={loading}
            icon={<Sparkles size={20} />} size="lg" disabled={!selectedUser}>
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

            {/* Title row + toggle button */}
            <div className="results-header-top">
              <div>
                <h2>Recomendaciones para {selectedUser?.nombre}</h2>
                <p>
                  Mostrando <strong>{filteredRecommendations.length}</strong> de{' '}
                  <strong>{recommendations.length}</strong> resultados
                </p>
              </div>
              <button
                className={`result-filter-toggle ${showResultFilters ? 'active' : ''}`}
                onClick={() => setShowResultFilters(prev => !prev)}
              >
                <SlidersHorizontal size={16} />
                Filtrar resultados
                {activeFilterCount > 0 && (
                  <span className="filter-badge">{activeFilterCount}</span>
                )}
              </button>
            </div>

            {showResultFilters && (
              <div className="result-filters-panel animate-fadeIn">

                <div className="result-filters-header">
                  <span className="result-filters-title">Filtros de Resultados</span>
                  {activeFilterCount > 0 && (
                    <button className="result-filters-reset" onClick={resetResultFilters}>
                      <X size={14} />
                      Limpiar filtros
                    </button>
                  )}
                </div>
                <div className="result-filters-body">

                  <div className="result-filters-col result-filters-col--left">
                    <div className="result-filter-group">
                      <label>
                        Rango Mínimo{' '}
                        <span className="label-hint">
                          ({filterRating > 0 ? `${filterRating}★` : 'Todos'})
                        </span>
                      </label>
                      <input type="range" min="0" max="5" step="0.5"
                        value={filterRating}
                        onChange={(e) => setFilterRating(Number(e.target.value))}
                        className="range-input" />
                      <div className="range-labels"><span>0</span><span>5★</span></div>
                    </div>

                    <div className="result-filter-group">
                      <label>
                        Confianza Mínima{' '}
                        <span className="label-hint">
                          ({filterConfianza > 0 ? `${filterConfianza}%` : 'Todos'})
                        </span>
                      </label>
                      <input type="range" min="0" max="100" step="5"
                        value={filterConfianza}
                        onChange={(e) => setFilterConfianza(Number(e.target.value))}
                        className="range-input" />
                      <div className="range-labels"><span>0%</span><span>100%</span></div>
                    </div>
                  </div>

                  <div className="result-filters-col result-filters-col--right">
                    <div className="result-filter-group">
                      <label>Rango de Precios ($)</label>
                      <div className="price-range-row">
                        <input type="number" placeholder="Min" value={filterPrecioMin}
                          onChange={(e) => setFilterPrecioMin(e.target.value)}
                          className="text-input price-input" />
                        <span className="price-separator">–</span>
                        <input type="number" placeholder="Max" value={filterPrecioMax}
                          onChange={(e) => setFilterPrecioMax(e.target.value)}
                          className="text-input price-input" />
                      </div>
                    </div>

                    <div className="result-filter-group">
                      <label>Restaurante</label>
                      <select value={filterRestaurante}
                        onChange={(e) => setFilterRestaurante(e.target.value)}
                        className="select-input">
                        <option value="">Todos los restaurantes</option>
                        {resultRestaurantes.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {resultCategories.length > 0 && (
                  <div className="result-filter-group result-filter-group--full">
                    <label>
                      Categoría{' '}
                      <span className="label-hint">
                        ({filterCategorias.length > 0
                          ? `${filterCategorias.length} seleccionadas`
                          : 'Todas'})
                      </span>
                    </label>
                    <div className="categories-chip-grid">
                      {resultCategories.map(cat => (
                        <label key={cat}
                          className={`category-chip ${filterCategorias.includes(cat) ? 'selected' : ''}`}>
                          <input type="checkbox" checked={filterCategorias.includes(cat)}
                            onChange={() => toggleResultCategory(cat)}
                            style={{ display: 'none' }} />
                          {cat}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {filteredRecommendations.length === 0 && (
                  <div className="result-filters-empty">
                    <AlertCircle size={16} />
                    Ningún resultado coincide con los filtros actuales.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="recommendations-grid">
            {filteredRecommendations.map((rec, index) => (
              <div key={rec.id} className={`animate-fadeIn stagger-${Math.min(index + 1, 5)}`}>
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
          <p>Selecciona un usuario y haz clic en "Generar Recomendaciones" para comenzar</p>
        </div>
      )}
    </div>
  );
};