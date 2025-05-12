import api from "./api";

const estacionamentoService = {
  // Listar todos os estacionamentos
  listarEstacionamentos: async () => {
    try {
      const response = await api.get("/estacionamento");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obter um estacionamento pelo ID
  obterEstacionamentoPorId: async (id) => {
    try {
      const response = await api.get(`/estacionamento/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Criar um novo estacionamento
  criarEstacionamento: async (estacionamentoData) => {
    try {
      const response = await api.post("/estacionamento", estacionamentoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Atualizar um estacionamento existente
  atualizarEstacionamento: async (id, estacionamentoData) => {
    try {
      const response = await api.put(
        `/estacionamento/${id}`,
        estacionamentoData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Alternar o status do estacionamento (ativo/inativo)
  alternarStatusEstacionamento: async (id) => {
    try {
      const response = await api.put(`/estacionamento/toggle/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Excluir um estacionamento
  excluirEstacionamento: async (id) => {
    try {
      const response = await api.delete(`/estacionamento/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default estacionamentoService;
