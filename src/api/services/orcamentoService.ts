import api from '../api';

export interface Orcamento {
  id?: number;
  limiteValor: number;
  mesAno: string;
  usuario: { id: number };
  categoria: { id: number };
}

export const orcamentoService = {
  listarTodos: async (usuarioId?: number) => {
    const params = usuarioId ? { usuarioId } : {};
    const response = await api.get<Orcamento[]>('/orcamentos', { params });
    return response.data;
  },
  buscarPorId: async (id: number) => {
    const response = await api.get<Orcamento>(`/orcamentos/${id}`);
    return response.data;
  },
  criar: async (orcamento: Orcamento) => {
    const response = await api.post<Orcamento>('/orcamentos', orcamento);
    return response.data;
  },
  atualizar: async (id: number, orcamento: Orcamento) => {
    const response = await api.put<Orcamento>(`/orcamentos/${id}`, orcamento);
    return response.data;
  },
  deletar: async (id: number) => {
    await api.delete(`/orcamentos/${id}`);
  }
};
