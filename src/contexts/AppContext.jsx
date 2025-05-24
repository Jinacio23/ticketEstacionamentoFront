import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from "react";
import estacionamentoService from "../services/estacionamentoService";
import { useAuth } from "./AuthContext";

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// Provedor de contexto
export const AppProvider = ({ children }) => {
  const [estacionamentos, setEstacionamentos] = useState([]);
  const [loadingEstacionamentos, setLoadingEstacionamentos] = useState(false);
  const [estacionamentoError, setEstacionamentoError] = useState(null);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const { isAuthenticated } = useAuth();

  // useMemo para calcular estacionamentos ativos com base na lista atual
  const estacionamentosAtivos = useMemo(() => {
    return estacionamentos.filter((est) => est.status);
  }, [estacionamentos]);

  // useCallback para evitar recriação da função em cada render
  const carregarEstacionamentos = useCallback(async () => {
    if (!isAuthenticated) {
      console.log("Não autenticado, carregamento de estacionamentos pulado");
      return;
    }

    try {
      setEstacionamentoError(null);
      setLoadingEstacionamentos(true);
      const data = await estacionamentoService.listarEstacionamentos();
      setEstacionamentos(data);
    } catch (error) {
      console.error("Erro ao carregar estacionamentos:", error);
      setEstacionamentoError(
        error.response?.data?.message || 
        "Não foi possível carregar os estacionamentos. Verifique sua conexão ou tente novamente mais tarde."
      );
    } finally {
      setLoadingEstacionamentos(false);
    }
  }, [isAuthenticated]);

  // Ações CRUD
  const adicionarEstacionamento = async (estacionamento) => {
    try {
      setEstacionamentoError(null);
      const novo = await estacionamentoService.criarEstacionamento(estacionamento);
      setEstacionamentos((prev) => [...prev, novo]);
      return novo;
    } catch (error) {
      console.error("Erro ao adicionar estacionamento:", error);
      setEstacionamentoError(
        error.response?.data?.message || 
        "Não foi possível adicionar o estacionamento. Tente novamente."
      );
      throw error;
    }
  };

  const atualizarEstacionamento = async (id, dados) => {
    try {
      setEstacionamentoError(null);
      const atualizado = await estacionamentoService.atualizarEstacionamento(id, dados);
      setEstacionamentos((prev) =>
        prev.map((est) => (est.id === id ? atualizado : est))
      );
      return atualizado;
    } catch (error) {
      console.error("Erro ao atualizar estacionamento:", error);
      setEstacionamentoError(
        error.response?.data?.message || 
        "Não foi possível atualizar o estacionamento. Tente novamente."
      );
      throw error;
    }
  };

  const removerEstacionamento = async (id) => {
    try {
      setEstacionamentoError(null);
      await estacionamentoService.excluirEstacionamento(id);
      setEstacionamentos((prev) => prev.filter((est) => est.id !== id));
    } catch (error) {
      console.error("Erro ao remover estacionamento:", error);
      setEstacionamentoError(
        error.response?.data?.message || 
        "Não foi possível remover o estacionamento. Tente novamente."
      );
      throw error;
    }
  };

  // Tema
  const toggleDarkMode = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    localStorage.setItem("darkMode", newDark);
  };

  // Carregar dados ao autenticar
  useEffect(() => {
    if (isAuthenticated) {
      carregarEstacionamentos();
    }
  }, [isAuthenticated, carregarEstacionamentos]);

  // Memoizar o contexto para evitar renders desnecessários
  const contextValue = useMemo(() => ({
    estacionamentos,
    estacionamentosAtivos,
    loadingEstacionamentos,
    estacionamentoError,
    darkMode,

    carregarEstacionamentos,
    adicionarEstacionamento,
    atualizarEstacionamento,
    removerEstacionamento,
    toggleDarkMode,
  }), [
    estacionamentos,
    estacionamentosAtivos,
    loadingEstacionamentos,
    estacionamentoError,
    darkMode,
    carregarEstacionamentos
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
