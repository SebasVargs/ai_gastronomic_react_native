// src/pages/Analytics.tsx

import React, { useEffect, useState } from 'react';
import { TrendingUp, Activity, Zap } from 'lucide-react';
import { MetricCard } from '../components/Card';
import apiClient from '../services/api';
import './Analytics.css';

export const Analytics: React.FC = () => {
  const [modelInfo, setModelInfo] = useState<any>(null);

  useEffect(() => {
    loadModelInfo();
  }, []);

  const loadModelInfo = async () => {
    const response = await apiClient.getModelPerformance();
    if (response.success) {
      setModelInfo(response.data);
    }
  };

  const modelMetrics = modelInfo?.random_forest || {};
  const mae = modelMetrics.mae || 0;
  const rmse = modelMetrics.rmse || 0;
  const r2 = modelMetrics.r2 || 0;

  return (
    <div className="analytics">
      <div className="analytics-header animate-fadeIn">
        <div>
          <h1>Análisis del Modelo</h1>
          <p>Rendimiento y métricas del sistema de IA</p>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="animate-fadeIn stagger-1">
          <MetricCard
            value={mae.toFixed(4)}
            label="MAE (Error Absoluto Medio)"
            icon={<Activity size={32} />}
          />
        </div>
        <div className="animate-fadeIn stagger-2">
          <MetricCard
            value={rmse.toFixed(4)}
            label="RMSE (Error Cuadrático Medio)"
            icon={<TrendingUp size={32} />}
          />
        </div>
        <div className="animate-fadeIn stagger-3">
          <MetricCard
            value={(r2 * 100).toFixed(1) + '%'}
            label="R² Score"
            icon={<Zap size={32} />}
          />
        </div>
      </div>

      <div className="model-info-card animate-fadeIn stagger-4">
        <h3>Estado del Modelo</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Random Forest</span>
            <span className={`status-badge ${modelInfo?.model_status?.random_forest_trained ? 'status-active' : 'status-inactive'}`}>
              {modelInfo?.model_status?.random_forest_trained ? 'Entrenado' : 'No Entrenado'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">K-Means Clustering</span>
            <span className={`status-badge ${modelInfo?.model_status?.kmeans_fitted ? 'status-active' : 'status-inactive'}`}>
              {modelInfo?.model_status?.kmeans_fitted ? 'Ajustado' : 'Ajustado'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Datos Sintéticos</span>
            <span className="info-value">
              {'1.780.000'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
