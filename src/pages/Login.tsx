// src/pages/Login.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const VALID_USER = 'admin';
const VALID_PASS = '123';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === VALID_USER && password === VALID_PASS) {
      localStorage.setItem('isLoggedIn', 'true');
      navigate('/');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };
  //TODO: Implementar login con API
  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Sistema Gastronómico</h1>
        <p className="login-subtitle">Ingresa tus credenciales para acceder</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              required
            />
          </div>
          <div className="login-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn">
            Ingresar
          </button>
        </form>

        <p className="login-footer">© 2026 Recomendaciones Gastronómicas v1.0</p>
      </div>
    </div>
  );
};
