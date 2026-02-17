// src/components/RecommendationCard.tsx

import React from 'react';
import { Star, TrendingUp, DollarSign, UtensilsCrossed } from 'lucide-react';
import { Card } from './Card';
import type { Recommendation } from '../types';
import './RecommendationCard.css';

interface RecommendationCardProps {
  recommendation: Recommendation;
  rank?: number;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
}) => {

  return (
    <Card className="recommendation-card" hover>

      <div className="recommendation-header">
        <div className="recommendation-category-badge">
          <UtensilsCrossed size={14} />
          <span>{recommendation.categoria_plato}</span>
        </div>
        <div className="recommendation-restaurant">
          {recommendation.restaurante}
        </div>
      </div>

      <h3 className="recommendation-title">{recommendation.nombre}</h3>

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
    </Card>
  );
};
