import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { CircularProgress, Box } from "@mui/material";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Mostrar indicador de carregamento enquanto verifica a autenticação
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirecionar para login se não estiver autenticado
  if (!isAuthenticated) {
    // Salvar a localização atual para redirecionar de volta após o login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Renderizar o componente filho se estiver autenticado
  return children;
};

export default ProtectedRoute;