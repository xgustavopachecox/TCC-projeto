import api from '../api';

export interface Meta {
  id?: number;
  nome: string;
  valorAlvo: number;
  valorAtual?: number;
  prazo: string;
  usuario: { id: number };
}

export const metaService = {
  listarTodos: async (usuarioId?: number) => {
    const params = usuarioId ? { usuarioId } : {};
    const response = await api.get<Meta[]>('/metas', { params });
    return response.data;
  },
  buscarPorId: async (id: number) => {
    const response = await api.get<Meta>(`/metas/${id}`);
    return response.data;
  },
  criar: async (meta: Meta) => {
    const response = await api.post<Meta>('/metas', meta);
    return response.data;
  },
  atualizar: async (id: number, meta: Meta) => {
    const response = await api.put<Meta>(`/metas/${id}`, meta);
    return response.data;
  },
  deletar: async (id: number) => {
    await api.delete(`/metas/${id}`);
  }
};
