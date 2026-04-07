// src/components/RecommendationCard.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Star, TrendingUp, DollarSign, UtensilsCrossed, MoreVertical, Phone, MapPin, ChefHat } from 'lucide-react';
import { Card } from './Card';
import type { Recommendation } from '../types';
import { RestaurantPlatesModal } from './RestaurantPlatesModal';
import { MapModal } from './MapModal';
import './RecommendationCard.css';

interface RecommendationCardProps {
  recommendation: Recommendation;
  rank?: number;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
}) => {

  const [menuOpen, setMenuOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showPlates, setShowPlates] = useState(false);
  const [_showReviews, _setShowReviews] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleCall = () => {
    if (recommendation.telefono) {
      window.location.href = `tel:${recommendation.telefono}`;
    }
    setMenuOpen(false);
  };

  const handleMap = () => {
    setMenuOpen(false);
    setShowMap(true);
  };

  const handlePlates = () => {
    setMenuOpen(false);
    setShowPlates(true);
  }

  const restaurantName = recommendation.nombre_restaurante || recommendation.restaurante || "Restaurante";
  const restaurantId = recommendation.restaurante_id || "";
  const hasCoords = recommendation.latitud !== undefined && recommendation.longitud !== undefined;

  return (
    <>
      <Card className="recommendation-card" hover>

        <div className="recommendation-header">
          <div className="recommendation-category-badge">
            <UtensilsCrossed size={14} />
            <span>{recommendation.categoria_plato}</span>
          </div>
          <div className="recommendation-restaurant">
            {restaurantName}
          </div>
        </div>

        <h3 className="recommendation-title">{recommendation.nombre || recommendation.nombre_plato}</h3>

        {recommendation.descripcion && (
          <p className="recommendation-description">{recommendation.descripcion}</p>
        )}

        <div className="recommendation-metrics">
          <div className="metric-item">
            <div className="metric-item-icon rating">
              <Star size={16} fill="currentColor" />
            </div>
            <div className="metric-item-content">
              <div className="metric-item-value">
                {recommendation.predicted_rating.toFixed(1)}
              </div>
              <div className="metric-item-label">Rating</div>
            </div>
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  fill={i < Math.round(recommendation.predicted_rating) ? "currentColor" : "none"}
                  className={i < Math.round(recommendation.predicted_rating) ? "filled" : ""}
                />
              ))}
            </div>
          </div>

          <div className="metric-item">
            <div className="metric-item-icon confidence">
              <TrendingUp size={16} />
            </div>
            <div className="metric-item-content">
              <div className="metric-item-value">
                {Math.round(recommendation.ml_confidence * 100)}%
              </div>
              <div className="metric-item-label">Confianza</div>
            </div>
            <div className="confidence-bar">
              <div
                className="confidence-fill"
                style={{ width: `${recommendation.ml_confidence * 100}%` }}
              />
            </div>
          </div>

          <div className="metric-item">
            <div className="metric-item-icon price">
              <DollarSign size={16} />
            </div>
            <div className="metric-item-content">
              <div className="metric-item-value">
                ${recommendation.precio.toLocaleString()}
              </div>
              <div className="metric-item-label">Precio</div>
            </div>
          </div>
        </div>

        <div className="card-actions-row">
          <div className="card-menu-wrapper" ref={menuRef}>
            <button
              className="card-menu-btn"
              onClick={() => setMenuOpen(p => !p)}
              aria-label="Opciones del restaurante"
            >
              <MoreVertical size={18} />
            </button>

            {menuOpen && (
              <div className="card-menu-dropdown">
                <button
                  className="card-menu-item"
                  onClick={handleCall}
                  disabled={!recommendation.telefono}
                  title={!recommendation.telefono ? 'Teléfono no disponible' : ''}
                >
                  <span className="card-menu-item-icon phone">
                    <Phone size={14} />
                  </span>
                  Llamar al restaurante
                  {!recommendation.telefono && (
                    <span className="card-menu-item-hint">No disponible</span>
                  )}
                </button>

                <button
                  className="card-menu-item"
                  onClick={handleMap}
                  disabled={!hasCoords}
                  title={!hasCoords ? 'Ubicación no disponible' : ''}
                >
                  <span className="card-menu-item-icon map">
                    <MapPin size={14} />
                  </span>
                  Ubicar en el mapa
                </button>

                <button
                  className="card-menu-item"
                  onClick={handlePlates}
                  disabled={!restaurantId}
                >
                  <span className="card-menu-item-icon plates">
                    <ChefHat size={14} />
                  </span>
                  Ver platos del restaurante
                </button>
              </div>
            )}
          </div>
        </div>

      </Card>

      {/* Modals */}
      {showMap && hasCoords && (
        <MapModal
          restaurantName={restaurantName}
          lat={recommendation.latitud!}
          lng={recommendation.longitud!}
          onClose={() => setShowMap(false)}
        />
      )}

      {showPlates && restaurantId && (
        <RestaurantPlatesModal
          restaurantId={restaurantId}
          restaurantName={restaurantName}
          onClose={() => setShowPlates(false)}
        />
      )}
    </>
  );
};
