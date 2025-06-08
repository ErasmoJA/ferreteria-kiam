import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay usuario logueado al cargar
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        setUser(parsedUserData);
      } catch (error) {
        // Si hay error parseando, limpiar localStorage
        console.error('Error parsing user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
    
    setIsLoading(false);
  }, []);

  // Función para manejar login exitoso
  const handleLogin = (userData) => {
    setUser(userData);
  };

  // Función para logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  // Función para verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('authToken');
  };

  // Función para obtener el token
  const getToken = () => {
    return localStorage.getItem('authToken');
  };

  // Función para actualizar datos del usuario
  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem('userData', JSON.stringify(newUserData));
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    handleLogin,
    handleLogout,
    getToken,
    updateUser
  };
};