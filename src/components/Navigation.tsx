// src/components/Navigation.tsx

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Sparkles, BarChart3, Settings, LogOut } from 'lucide-react';
import './Navigation.css';
import { Utensils } from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: <Home size={20} /> },
  { path: '/users', label: 'Usuarios', icon: <Users size={20} /> },
  { path: '/recommendations', label: 'Recomendaciones', icon: <Sparkles size={20} /> },
  { path: '/analytics', label: 'Análisis', icon: <BarChart3 size={20} /> },
  { path: '/settings', label: 'Configuración', icon: <Settings size={20} /> },
];

export const Navigation: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return (
    <nav className="navigation">
      <div className="nav-header">
        <div className="nav-logo">
          <div>
            <Utensils size={32} strokeWidth={2.2} />
          </div>
          <div className="logo-text">
            <h1>GastroAI</h1>
            <p>Recomendaciones Inteligentes</p>
          </div>
        </div>
      </div>

      <div className="nav-links">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            <span className="nav-link-icon">{item.icon}</span>
            <span className="nav-link-label">{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="nav-footer">
        <div className="connection-status">
          <div className="status-indicator status-connected"></div>
          <span>Conectado</span>
        </div>
        <button className="nav-link" onClick={handleLogout} style={{ width: '100%', textAlign: 'left', cursor: 'pointer', marginTop: '8px', color: 'var(--primary-400)' }}>
          <span className="nav-link-icon"><LogOut size={20} /></span>
          <span className="nav-link-label">Cerrar Sesión</span>
        </button>
      </div>
    </nav>
  );
};

