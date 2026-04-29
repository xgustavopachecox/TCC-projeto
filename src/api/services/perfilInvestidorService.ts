import api from '../api';

export interface PerfilInvestidor {
  id?: number;
  tipoPerfil: string;
  dataAnalise: string;
  usuario: { id: number };
}

export const perfilInvestidorService = {
  listarTodos: async () => {
    const response = await api.get<PerfilInvestidor[]>('/perfis');
    return response.data;
  },
  buscarPorUsuarioId: async (usuarioId: number) => {
    const response = await api.get<PerfilInvestidor>(`/perfis/usuario/${usuarioId}`);
    return response.data;
  },
  buscarPorId: async (id: number) => {
    const response = await api.get<PerfilInvestidor>(`/perfis/${id}`);
    return response.data;
  },
  criar: async (perfil: PerfilInvestidor) => {
    const response = await api.post<PerfilInvestidor>('/perfis', perfil);
    return response.data;
  },
  atualizar: async (id: number, perfil: PerfilInvestidor) => {
    const response = await api.put<PerfilInvestidor>(`/perfis/${id}`, perfil);
    return response.data;
  },
  deletar: async (id: number) => {
    await api.delete(`/perfis/${id}`);
  }
};
