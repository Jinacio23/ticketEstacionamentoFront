import React, { createContext, useState, useContext, useEffect } from "react";
import estacionamentoService from "../services/estacionamentoService";

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

  // Estado para tema
  const [darkMode, setDarkMode] = useState(false);

  // Estado para usuário (simulado)
  const [user, setUser] = useState({
    name: "Usuário Teste",
    email: "usuario@teste.com",
    role: "admin",
  });

  // Carregar estacionamentos
  const carregarEstacionamentos = async () => {
    try {
      setLoadingEstacionamentos(true);
      const data = await estacionamentoService.listarEstacionamentos();
      setEstacionamentos(data);
      setEstacionamentosAtivos(data.filter((est) => est.status));
      setLoadingEstacionamentos(false);
    } catch (error) {
      console.error("Erro ao carregar estacionamentos:", error);
      setLoadingEstacionamentos(false);
    }
  };

  // Ações para estacionamentos
  const adicionarEstacionamento = (estacionamento) => {
    setEstacionamentos([...estacionamentos, estacionamento]);
    if (estacionamento.status) {
      setEstacionamentosAtivos([...estacionamentosAtivos, estacionamento]);
    }
  };

  const atualizarEstacionamento = (id, dadosAtualizados) => {
    const estacionamentoIndex = estacionamentos.findIndex(
      (est) => est.id === id
    );
    if (estacionamentoIndex !== -1) {
      const novosEstacionamentos = [...estacionamentos];
      novosEstacionamentos[estacionamentoIndex] = {
        ...novosEstacionamentos[estacionamentoIndex],
        ...dadosAtualizados,
      };
      setEstacionamentos(novosEstacionamentos);
      setEstacionamentosAtivos(
        novosEstacionamentos.filter((est) => est.status)
      );
    }
  };

  const removerEstacionamento = (id) => {
    setEstacionamentos(estacionamentos.filter((est) => est.id !== id));
    setEstacionamentosAtivos(
      estacionamentosAtivos.filter((est) => est.id !== id)
    );
  };

  // Ações para tema
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Efeito para carregar dados iniciais
  useEffect(() => {
    carregarEstacionamentos();
  }, []);

  // Valores a serem disponibilizados
  const contextValue = {
    // Dados
    estacionamentos,
    estacionamentosAtivos,
    loadingEstacionamentos,
    darkMode,
    user,

    // Ações
    carregarEstacionamentos,
    adicionarEstacionamento,
    atualizarEstacionamento,
    removerEstacionamento,
    toggleDarkMode,
    setUser,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export default AppContext;
