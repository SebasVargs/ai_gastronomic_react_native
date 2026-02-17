// src/pages/Settings.tsx

import React, { useState } from 'react';
import { RefreshCw, Database, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import apiClient from '../services/api';
import './Settings.css';

export const Settings: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('connected');

  const testConnection = async () => {
    setTesting(true);
    const response = await apiClient.checkHealth();
    setConnectionStatus(response.success ? 'connected' : 'disconnected');
    setTesting(false);
  };

  const clearCache = () => {
    localStorage.clear();
    alert('Caché limpiado exitosamente');
  };

  return (
    <div className="settings">
      <div className="settings-header animate-fadeIn">
        <div>
          <h1>Configuración</h1>
          <p>Administra las opciones del sistema</p>
        </div>
      </div>

      <div className="settings-grid">
        <Card className="settings-card animate-fadeIn stagger-1">
          <h3>Conexión con la API</h3>
          <div className="setting-item">
            <div>
              <div className="setting-label">URL de la API</div>
              <div className="setting-value">http://localhost:8000</div>
            </div>
          </div>
          <div className="setting-item">
            <div>
              <div className="setting-label">Estado de Conexión</div>
              <div className={`connection-badge ${connectionStatus}`}>
                {connectionStatus === 'connected' ? '✅ Conectado' : '❌ Desconectado'}
              </div>
            </div>
          </div>
          <Button
            onClick={testConnection}
            loading={testing}
            icon={<RefreshCw size={20} />}
            variant="outline"
          >
            Probar Conexión
          </Button>
        </Card>

        <Card className="settings-card animate-fadeIn stagger-2">
          <h3>Modelo de IA</h3>
          <div className="setting-item">
            <div>
              <div className="setting-label">Algoritmo</div>
              <div className="setting-value">Random Forest</div>
            </div>
          </div>
          <div className="setting-item">
            <div>
              <div className="setting-label">Clustering</div>
              <div className="setting-value">K-Means (5 clusters)</div>
            </div>
          </div>
        </Card>

        <Card className="settings-card animate-fadeIn stagger-3">
          <h3>Mantenimiento</h3>
          <div className="maintenance-actions">
            <Button
              onClick={clearCache}
              icon={<Trash2 size={20} />}
              variant="outline"
            >
              Limpiar Caché
            </Button>
            <Button
              onClick={() => window.location.reload()}
              icon={<RefreshCw size={20} />}
              variant="outline"
            >
              Recargar Aplicación
            </Button>
            <Button
              onClick={() => localStorage.setItem('last_recommendations', '[]')}
              icon={<Database size={20} />}
              variant="outline"
            >
              Resetear Dashboard
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
