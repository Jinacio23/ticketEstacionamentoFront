import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api"; // Assumindo que você tem um serviço de API configurado

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar token existente ao iniciar a aplicação
  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (token) {
      // Configurar o token no cabeçalho de todas as requisições
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // Validar o token no backend
      validateToken();
    } else {
      setLoading(false);
    }
  }, []);
  
  // Validar o token no backend
  const validateToken = async () => {
    try {
      const response = await api.get("/me"); // Endpoint para validar token
      setUser(response.data);
      setError(null);
    } catch (err) {
      console.error("Erro ao validar token:", err);
      // Se o token for inválido, limpar o armazenamento
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Função de login
  const login = async (nome, senha) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post("/login", { nome, senha });
      const { accessToken, refreshToken } = response.data;
      
      // Salvar token e refresh token no localStorage
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      
      // Configurar token para todas as requisições futuras
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      
      await validateToken();
      // Atualizar estado do usuário
      // setUser(userData);
      return true;
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      setError(
        err.response?.data?.message || 
        "Falha na autenticação. Verifique suas credenciais."
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = () => {
    // Remover tokens do localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    
    // Remover token dos cabeçalhos da API
    delete api.defaults.headers.common["Authorization"];
    
    // Limpar estado do usuário
    setUser(null);
  };

  // Valor fornecido pelo contexto
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}