// src/components/Card.tsx

import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  gradient = false 
}) => {
  return (
    <div className={`card ${hover ? 'card-hover' : ''} ${gradient ? 'card-gradient' : ''} ${className}`}>
      {children}
    </div>
  );
};

interface MetricCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  value, 
  label, 
  icon,
  trend 
}) => {
  return (
    <Card className="metric-card" hover>
      <div className="metric-card-content">
        {icon && <div className="metric-icon">{icon}</div>}
        <div className="metric-details">
          <div className="metric-value">{value}</div>
          <div className="metric-label">{label}</div>
          {trend && (
            <div className={`metric-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
