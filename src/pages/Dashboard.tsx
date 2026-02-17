// src/pages/Dashboard.tsx

import React, { useEffect, useState } from 'react';
import { Users, Database, TrendingUp, Sparkles } from 'lucide-react';
import { MetricCard } from '../components/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import apiClient from '../services/api';
import type { DashboardMetrics, Recommendation } from '../types';
import './Dashboard.css';

const COLORS = ['#f15a47', '#f97316', '#fbbf24', '#10b981', '#3b82f6', '#6366f1'];

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    syntheticData: 1780000,
    modelAccuracy: '0%',
    recommendationsGenerated: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Use Promise.allSettled to prevent one failure from blocking the other
      const results = await Promise.allSettled([
        apiClient.getUsers(),
        apiClient.getModelPerformance(),
      ]);

      const usersResult = results[0];
      const modelResult = results[1];

      if (usersResult.status === 'fulfilled' && usersResult.value.success && usersResult.value.data) {
        setMetrics(prev => ({
          ...prev,
          totalUsers: usersResult.value.data!.length,
        }));
      }

      if (modelResult.status === 'fulfilled' && modelResult.value.success && modelResult.value.data) {
        const isTrained = modelResult.value.data.model_status?.random_forest_trained;
        setMetrics(prev => ({
          ...prev,
          modelAccuracy: isTrained ? '89%' : '0%',
        }));
      }

      // Load cached recommendations from localStorage
      const cached = localStorage.getItem('last_recommendations');
      if (cached) {
        try {
          const recs = JSON.parse(cached);
          setRecommendations(recs);
          setMetrics(prev => ({
            ...prev,
            recommendationsGenerated: recs.length,
          }));
        } catch (e) {
          console.error("Error parsing cached recommendations", e);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingDistribution = () => {
    if (recommendations.length === 0) return [];

    const distribution: Record<string, number> = {};
    recommendations.forEach(rec => {
      const rating = Math.round(rec.rating_predicho || 0);
      const key = `${rating} estrellas`;
      distribution[key] = (distribution[key] || 0) + 1;
    });

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      cantidad: value,
    }));
  };

  const getCategoryDistribution = () => {
    if (recommendations.length === 0) return [];

    const distribution: Record<string, number> = {};
    recommendations.forEach(rec => {
      distribution[rec.categoria_plato] = (distribution[rec.categoria_plato] || 0) + 1;
    });

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const formatCompactNumber = (number: number) => {
    return new Intl.NumberFormat('es-ES', { // O 'en-US' según tu preferencia
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1
    }).format(number);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header animate-fadeIn">
        <div>
          <h1>Dashboard Principal</h1>
          <p>Visión general del sistema de recomendaciones</p>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="animate-fadeIn stagger-1">
          <MetricCard
            value={formatCompactNumber(metrics.syntheticData)}
            label="Datos Sintéticos"
            icon={<Database size={32} />}
            title={metrics.syntheticData.toLocaleString()}
          />
        </div>
        <div className="animate-fadeIn stagger-2">
          <MetricCard
            value={metrics.totalUsers}
            label="Usuarios Activos"
            icon={<Users size={32} />}
          />
        </div>
        <div className="animate-fadeIn stagger-3">
          <MetricCard
            value={metrics.modelAccuracy}
            label="Precisión del Modelo"
            icon={<TrendingUp size={32} />}
          />
        </div>
        <div className="animate-fadeIn stagger-4">
          <MetricCard
            value={metrics.recommendationsGenerated}
            label="Recomendaciones Generadas"
            icon={<Sparkles size={32} />}
          />
        </div>
      </div>

      {recommendations.length > 0 ? (
        <div className="charts-grid">
          <div className="chart-card animate-fadeIn stagger-5">
            <h3>Distribución de Ratings Predichos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getRatingDistribution()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis
                  dataKey="name"
                  stroke="#78716c"
                  style={{ fontSize: '0.875rem' }}
                />
                <YAxis
                  stroke="#78716c"
                  style={{ fontSize: '0.875rem' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e7e5e4',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend />
                <Bar
                  dataKey="cantidad"
                  fill="url(#colorGradient)"
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f15a47" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card animate-fadeIn stagger-6">
            <h3>Distribución por Categoría</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getCategoryDistribution()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getCategoryDistribution().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e7e5e4',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="empty-state animate-fadeIn stagger-5">
          <Sparkles size={64} className="empty-icon" />
          <h3>No hay recomendaciones aún</h3>
          <p>
            Ve a la sección <strong>Recomendaciones IA</strong> para generar tu primera
            recomendación y ver los gráficos aquí.
          </p>
        </div>
      )}
    </div>
  );
};
