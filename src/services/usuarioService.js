//Rotas
// GET - /usuarios
// POST - /usuarios - body:{string nome, string senha, long idEstacionamento}
// PUT - /usuarios/{id}
// DELETE - /usuarios/{id}

import api from "./api";

const usuarioService = {
  // Listar todos os usuários
  listarUsuarios: async () => {
    try {
      const response = await api.get("/usuarios");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obter um usuário pelo ID
  obterUsuarioPorId: async (id) => {
    try {
      const response = await api.get(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Criar um novo usuário
  criarUsuario: async (usuarioData) => {
    try {
      const response = await api.post("/usuarios", usuarioData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Atualizar um usuário existente
  atualizarUsuario: async (id, usuarioData) => {
    try {
      const response = await api.put(`/usuarios/${id}`, usuarioData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Excluir um usuário
  excluirUsuario: async (id) => {
    try {
      const response = await api.delete(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default usuarioService;