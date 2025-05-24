import api from './api';

const authService = {
    // Login
    login: async (name, password) => {
        try {
            // Não coloque o objeto dentro de outro objeto chamado userLogin
            // Envie diretamente os dados no formato que a API espera
            const response = await api.post('/login', { name, password });
            
            // Se o login for bem-sucedido, você pode armazenar o token ou outras informações
            if (response.data.accessToken) {
                localStorage.setItem('token', response.data.accessToken);
                // Se houver dados do usuário
                // if (response.data.user) {
                //     localStorage.setItem('user', JSON.stringify(response.data.user));
                // }
                
                // Configurar o token no cabeçalho para requisições futuras
                api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
            }
            
            return response.data;
        } catch (error) {
            console.error('Erro no login:', error.response?.data || error.message);
            throw error;
        }
    },
    
    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
    },
    
    // Verificar se está autenticado
    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        return !!token; // Retorna true se o token existir
    },
    
    // Obter token atual
    getToken: () => {
        return localStorage.getItem('token');
    },
    
    // Obter usuário atual
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    },
    
    // Configurar token nos cabeçalhos da API
    setAuthHeader: (token) => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    }
};

export default authService;