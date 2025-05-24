import React, { createContext, useState, useContext, useEffect } from "react";
import estacionamentoService from "../services/estacionamentoService";
import { useAuth } from "./AuthContext"; // Importando o contexto de autenticação

// Criar o contexto
const AppContext = createContext();

// Hook personalizado para acessar o contexto
export const useAppContext = () => useContext(AppContext);

// Provedor de contexto
export const AppProvider = ({ children }) => {
  // Estado para estacionamentos
  const [estacionamentos, setEstacionamentos] = useState([]);
  const [estacionamentosAtivos, setEstacionamentosAtivos] = useState([]);
  const [loadingEstacionamentos, setLoadingEstacionamentos] = useState(false);
  const [estacionamentoError, setEstacionamentoError] = useState(null);

  // Estado para tema
   const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  // Obter o contexto de autenticação
  const { isAuthenticated } = useAuth();

  // Carregar estacionamentos apenas quando autenticado
  const carregarEstacionamentos = async () => {
    if (!isAuthenticated) {
      console.log("Não autenticado, carregamento de estacionamentos pulado");
      return;
    }

    try {
      setEstacionamentoError(null);
      setLoadingEstacionamentos(true);
      const data = await estacionamentoService.listarEstacionamentos();
      setEstacionamentos(data);
      setEstacionamentosAtivos(data.filter((est) => est.status));
    } catch (error) {
      console.error("Erro ao carregar estacionamentos:", error);
      setEstacionamentoError(
        error.response?.data?.message || 
        "Não foi possível carregar os estacionamentos. Verifique sua conexão ou tente novamente mais tarde."
      );
    } finally {
      setLoadingEstacionamentos(false);
    }
  };

  // Ações para estacionamentos
  const adicionarEstacionamento = async (estacionamento) => {
    try {
      setEstacionamentoError(null);
      const novoEstacionamento = await estacionamentoService.criarEstacionamento(estacionamento);
      setEstacionamentos([...estacionamentos, novoEstacionamento]);
      if (novoEstacionamento.status) {
        setEstacionamentosAtivos([...estacionamentosAtivos, novoEstacionamento]);
      }
      return novoEstacionamento;
    } catch (error) {
      console.error("Erro ao adicionar estacionamento:", error);
      setEstacionamentoError(
        error.response?.data?.message || 
        "Não foi possível adicionar o estacionamento. Tente novamente."
      );
      throw error;
    }
  };

  const atualizarEstacionamento = async (id, dadosAtualizados) => {
    try {
      setEstacionamentoError(null);
      const estacionamentoAtualizado = await estacionamentoService.atualizarEstacionamento(id, dadosAtualizados);
      
      const estacionamentoIndex = estacionamentos.findIndex(
        (est) => est.id === id
      );
      
      if (estacionamentoIndex !== -1) {
        const novosEstacionamentos = [...estacionamentos];
        novosEstacionamentos[estacionamentoIndex] = estacionamentoAtualizado;
        setEstacionamentos(novosEstacionamentos);
        setEstacionamentosAtivos(
          novosEstacionamentos.filter((est) => est.status)
        );
      }
      
      return estacionamentoAtualizado;
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
      setEstacionamentos(estacionamentos.filter((est) => est.id !== id));
      setEstacionamentosAtivos(
        estacionamentosAtivos.filter((est) => est.id !== id)
      );
    } catch (error) {
      console.error("Erro ao remover estacionamento:", error);
      setEstacionamentoError(
        error.response?.data?.message || 
        "Não foi possível remover o estacionamento. Tente novamente."
      );
      throw error;
    }
  };

  // Ações para tema
   const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
  };

  // Efeito para carregar dados iniciais SOMENTE quando estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      carregarEstacionamentos();
    }
  }, [isAuthenticated]); // Agora depende do estado de autenticação

  // Valores a serem disponibilizados
  const contextValue = {
    // Dados
    estacionamentos,
    estacionamentosAtivos,
    loadingEstacionamentos,
    estacionamentoError,
    darkMode,

    // Ações
    carregarEstacionamentos,
    adicionarEstacionamento,
    atualizarEstacionamento,
    removerEstacionamento,
    toggleDarkMode,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export default AppContext;