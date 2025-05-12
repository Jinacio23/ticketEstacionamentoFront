import api from "./api";

const ticketService = {
  // Listar todos os tickets
  listarTickets: async () => {
    try {
      const response = await api.get("/ticket");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Listar tickets por estacionamento
  listarTicketsPorEstacionamento: async (estacionamentoId) => {
    try {
      const response = await api.get(`/ticket/${estacionamentoId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Listar tickets ativos por estacionamento
  listarTicketsAtivos: async (estacionamentoId) => {
    try {
      const response = await api.get(`/ticket/${estacionamentoId}/ativos`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Gerar um novo ticket
  gerarTicket: async (estacionamentoId) => {
    try {
      const response = await api.post(`/ticket/${estacionamentoId}/generate`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Validar um ticket (registrar saída)
  validarTicket: async (token) => {
    try {
      const response = await api.put(`/ticket/${token}/validate`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Registrar pagamento de um ticket
  pagarTicket: async (token, formaPagamento) => {
    try {
      const response = await api.post(
        `/ticket/${token}/pagamento?formaPagamento=${formaPagamento}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default ticketService;
