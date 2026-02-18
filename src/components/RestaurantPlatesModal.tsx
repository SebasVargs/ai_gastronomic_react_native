// src/components/RestaurantPlatesModal.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { X, Star, DollarSign, UtensilsCrossed, Loader2, AlertCircle, SlidersHorizontal } from 'lucide-react';
import apiClient from '../services/api';
import './RestaurantPlatesModal.css';
import { Utensils } from "lucide-react";

interface Plate {
    id: string;
    nombre: string;
    categoria: string;
    precio: number;
    rating: number;
    popularidad: number;
    descripcion?: string;
}

interface RestaurantPlatesModalProps {
    restaurantId: string;
    restaurantName: string;
    onClose: () => void;
}

export const RestaurantPlatesModal: React.FC<RestaurantPlatesModalProps> = ({
    restaurantId,
    restaurantName,
    onClose,
}) => {
    const [plates, setPlates] = useState<Plate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [showFilters, setShowFilters] = useState(false);
    const [filterCategoria, setFilterCategoria] = useState<string[]>([]);
    const [filterPrecioMin, setFilterPrecioMin] = useState<string>('');
    const [filterPrecioMax, setFilterPrecioMax] = useState<string>('');
    const [filterRating, setFilterRating] = useState<number>(0);
    const [sortBy, setSortBy] = useState<'rating' | 'precio_asc' | 'precio_desc' | 'popularidad'>('rating');

    useEffect(() => {
        loadPlates();
    }, [restaurantId]);

    const loadPlates = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.getPlatesByRestaurant(restaurantId);
            if (response.success && Array.isArray(response.data)) {
                setPlates(response.data);
            } else {
                setError('No se pudieron cargar los platos del restaurante.');
            }
        } catch {
            setError('Error de conexión al cargar los platos.');
        } finally {
            setLoading(false);
        }
    };

    const categories = useMemo(() => {
        return Array.from(new Set(plates.map(p => p.categoria).filter(Boolean)));
    }, [plates]);

    const toggleCategoria = (cat: string) => {
        setFilterCategoria(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const resetFilters = () => {
        setFilterCategoria([]);
        setFilterPrecioMin('');
        setFilterPrecioMax('');
        setFilterRating(0);
        setSortBy('rating');
    };

    const activeFilterCount = [
        filterCategoria.length > 0,
        filterPrecioMin !== '',
        filterPrecioMax !== '',
        filterRating > 0,
    ].filter(Boolean).length;

    const filteredPlates = useMemo(() => {
        let result = plates.filter(p => {
            if (filterCategoria.length > 0 && !filterCategoria.includes(p.categoria)) return false;
            if (filterPrecioMin !== '' && p.precio < Number(filterPrecioMin)) return false;
            if (filterPrecioMax !== '' && p.precio > Number(filterPrecioMax)) return false;
            if (filterRating > 0 && p.rating < filterRating) return false;
            return true;
        });

        switch (sortBy) {
            case 'rating': return result.sort((a, b) => b.rating - a.rating);
            case 'precio_asc': return result.sort((a, b) => a.precio - b.precio);
            case 'precio_desc': return result.sort((a, b) => b.precio - a.precio);
            case 'popularidad': return result.sort((a, b) => b.popularidad - a.popularidad);
            default: return result;
        }
    }, [plates, filterCategoria, filterPrecioMin, filterPrecioMax, filterRating, sortBy]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="plates-modal">

                {/* Header */}
                <div className="plates-modal-header">
                    <div className="plates-modal-title">
                        <div>
                            <Utensils size={32} strokeWidth={2.2} />
                        </div>                        <div>
                            <h3>{restaurantName}</h3>
                            <p>
                                {loading ? 'Cargando...' : `${filteredPlates.length} de ${plates.length} platos`}
                            </p>
                        </div>
                    </div>
                    <div className="plates-modal-header-actions">
                        <button
                            className={`plates-filter-toggle ${showFilters ? 'active' : ''}`}
                            onClick={() => setShowFilters(p => !p)}
                        >
                            <SlidersHorizontal size={15} />
                            Filtros
                            {activeFilterCount > 0 && (
                                <span className="plates-filter-badge">{activeFilterCount}</span>
                            )}
                        </button>
                        <button className="modal-close-btn" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Filter panel */}
                {showFilters && (
                    <div className="plates-filters-panel">
                        <div className="plates-filters-row">

                            {/* Rating */}
                            <div className="plates-filter-group">
                                <label>
                                    Rating mínimo{' '}
                                    <span className="label-hint">({filterRating > 0 ? `${filterRating}★` : 'Todos'})</span>
                                </label>
                                <input type="range" min="0" max="5" step="0.5"
                                    value={filterRating}
                                    onChange={e => setFilterRating(Number(e.target.value))}
                                    className="range-input" />
                                <div className="range-labels"><span>0</span><span>5★</span></div>
                            </div>

                            {/* Precio */}
                            <div className="plates-filter-group">
                                <label>Rango de precio ($)</label>
                                <div className="price-range-row">
                                    <input type="number" placeholder="Min" value={filterPrecioMin}
                                        onChange={e => setFilterPrecioMin(e.target.value)}
                                        className="text-input price-input" />
                                    <span className="price-separator">–</span>
                                    <input type="number" placeholder="Max" value={filterPrecioMax}
                                        onChange={e => setFilterPrecioMax(e.target.value)}
                                        className="text-input price-input" />
                                </div>
                            </div>

                            {/* Ordenar */}
                            <div className="plates-filter-group">
                                <label>Ordenar por</label>
                                <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                                    className="select-input">
                                    <option value="rating">Mayor rating</option>
                                    <option value="popularidad">Más populares</option>
                                    <option value="precio_asc">Precio: menor a mayor</option>
                                    <option value="precio_desc">Precio: mayor a menor</option>
                                </select>
                            </div>
                        </div>

                        {/* Categorías */}
                        {categories.length > 0 && (
                            <div className="plates-filter-group">
                                <label>
                                    Categoría{' '}
                                    <span className="label-hint">
                                        ({filterCategoria.length > 0 ? `${filterCategoria.length} seleccionadas` : 'Todas'})
                                    </span>
                                </label>
                                <div className="categories-chip-grid">
                                    {categories.map(cat => (
                                        <label key={cat}
                                            className={`category-chip ${filterCategoria.includes(cat) ? 'selected' : ''}`}>
                                            <input type="checkbox" checked={filterCategoria.includes(cat)}
                                                onChange={() => toggleCategoria(cat)} style={{ display: 'none' }} />
                                            {cat}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeFilterCount > 0 && (
                            <button className="plates-filters-reset" onClick={resetFilters}>
                                <X size={13} /> Limpiar filtros
                            </button>
                        )}
                    </div>
                )}

                {/* Body */}
                <div className="plates-modal-body">
                    {loading && (
                        <div className="plates-loading">
                            <Loader2 size={36} className="spinner" />
                            <p>Cargando platos...</p>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="alert alert-error">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {!loading && !error && filteredPlates.length === 0 && (
                        <div className="plates-empty">
                            <UtensilsCrossed size={48} />
                            <p>No hay platos que coincidan con los filtros.</p>
                        </div>
                    )}

                    {!loading && !error && filteredPlates.length > 0 && (
                        <div className="plates-grid">
                            {filteredPlates.map(plate => (
                                <div key={plate.id} className="plate-card">
                                    <div className="plate-card-header">
                                        <span className="plate-category-badge">
                                            <UtensilsCrossed size={11} />
                                            {plate.categoria}
                                        </span>
                                    </div>

                                    <h4 className="plate-name">{plate.nombre}</h4>

                                    {plate.descripcion && (
                                        <p className="plate-description">{plate.descripcion}</p>
                                    )}

                                    <div className="plate-metrics">
                                        <div className="plate-metric">
                                            <div className="plate-metric-icon rating">
                                                <Star size={13} fill="currentColor" />
                                            </div>
                                            <span className="plate-metric-value">{plate.rating.toFixed(1)}</span>
                                            <span className="plate-metric-label">Rating</span>
                                        </div>

                                        <div className="plate-metric">
                                            <div className="plate-metric-icon price">
                                                <DollarSign size={13} />
                                            </div>
                                            <span className="plate-metric-value">${plate.precio.toLocaleString()}</span>
                                            <span className="plate-metric-label">Precio</span>
                                        </div>

                                        <div className="plate-metric">
                                            <div className="plate-metric-icon popularity">
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>🔥</span>
                                            </div>
                                            <span className="plate-metric-value">{plate.popularidad}</span>
                                            <span className="plate-metric-label">Popular</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};