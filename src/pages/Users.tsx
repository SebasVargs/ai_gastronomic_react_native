// src/pages/Users.tsx

import React, { useState, useEffect } from 'react';
import { UserPlus, Tag, Loader2, MapPin, Calendar } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import apiClient from '../services/api';
import type { User } from '../types';
import './Users.css';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    nombre: '',
    edad: '',
    origen: '',
    preferencias: [] as string[],
  });

  useEffect(() => {
    loadUsers();
    loadCategories();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const response = await apiClient.getUsers();
    if (response.success && response.data) {
      setUsers(response.data);
    }
    setLoading(false);
  };

  const loadCategories = async () => {
    const response = await apiClient.getCategories();
    if (response.success && response.data) {
      setCategories(response.data);
    }
  };

  const togglePreference = (pref: string) => {
    setFormData(prev => ({
      ...prev,
      preferencias: prev.preferencias.includes(pref)
        ? prev.preferencias.filter(p => p !== pref)
        : [...prev.preferencias, pref],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.preferencias.length === 0) {
      alert('Selecciona al menos una preferencia');
      return;
    }

    const userData = {
      nombre: formData.nombre,
      edad: Number(formData.edad),
      origen: formData.origen,
      preferencias: formData.preferencias,
    };

    const response = await apiClient.createUser(userData);
    if (response.success) {
      setShowForm(false);
      setFormData({ nombre: '', edad: '', origen: '', preferencias: [] });
      loadUsers();
    } else {
      alert(`Error creando usuario: ${response.error}`);
    }
  };

  if (loading) {
    return (
      <div className="users">
        <div className="loading-state">
          <Loader2 size={48} className="spinner" />
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users">
      <div className="users-header animate-fadeIn">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>Administra los usuarios del sistema</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          icon={<UserPlus size={20} />}
        >
          Nuevo Usuario
        </Button>
      </div>

      {showForm && (
        <Card className="user-form animate-fadeIn">
          <h3>Crear Nuevo Usuario</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  className="text-input"
                  placeholder="Juan Pérez"
                />
              </div>
              <div className="form-group">
                <label>Edad</label>
                <input
                  type="number"
                  value={formData.edad}
                  onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                  required
                  min="1"
                  max="120"
                  className="text-input"
                  placeholder="25"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Origen</label>
              <input
                type="text"
                value={formData.origen}
                onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                required
                className="text-input"
                placeholder="Colombia"
              />
            </div>
            <div className="form-group">
              <label>Preferencias <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #6b7280)' }}>({formData.preferencias.length} seleccionadas)</span></label>
              <div className="preferences-grid">
                {categories.map(cat => (
                  <label
                    key={cat}
                    className={`preference-chip ${formData.preferencias.includes(cat) ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.preferencias.includes(cat)}
                      onChange={() => togglePreference(cat)}
                      style={{ display: 'none' }}
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-actions">
              <Button type="submit" variant="primary" disabled={formData.preferencias.length === 0}>
                Crear Usuario
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="users-grid">
        {users.map((user, index) => (
          <Card
            key={user.id}
            className={`user-card animate-fadeIn stagger-${Math.min(index + 1, 5)}`}
            hover
          >
            <div className="user-avatar">
              {user.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <h3>{user.nombre}</h3>
              <div className="user-detail">
                <Calendar size={16} />
                <span>{user.edad} años</span>
              </div>
              <div className="user-detail">
                <MapPin size={16} />
                <span>{user.origen}</span>
              </div>
              {user.preferencias && user.preferencias.length > 0 && (
                <div className="user-preferences">
                  <Tag size={16} />
                  <div className="preferences-list">
                    {user.preferencias.map((pref, idx) => (
                      <span key={idx} className="preference-badge">{pref}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
