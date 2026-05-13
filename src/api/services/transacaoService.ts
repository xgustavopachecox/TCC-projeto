import api from '../api';
import { Categoria } from './categoriaService';

export interface Transacao {
  id?: number;
  tipo: string;
  valor: number;
  data: string;
  descricao?: string;
  usuario: { id: number };
  categoria: { id: number };
}

export const transacaoService = {
  listarTodos: async (usuarioId?: number) => {
    const params = usuarioId ? { usuarioId } : {};
    const response = await api.get<Transacao[]>('/transacoes', { params });
    return response.data;
  },
  buscarPorId: async (id: number) => {
    const response = await api.get<Transacao>(`/transacoes/${id}`);
    return response.data;
  },
  criar: async (transacao: Transacao) => {
    const response = await api.post<Transacao>('/transacoes', transacao);
    return response.data;
  },
  atualizar: async (id: number, transacao: Transacao) => {
    const response = await api.put<Transacao>(`/transacoes/${id}`, transacao);
    return response.data;
  },
  deletar: async (id: number) => {
    await api.delete(`/transacoes/${id}`);
  }
};

export interface TransacaoRecorrente {
  id?: number;
  tipo: string;
  valor: number;
  frequencia: string;
  dataInicio: string;
  proximaData: string;
  descricao?: string;
  status?: string;
  usuario: { id: number };
  categoria: { id: number };
}

export const recorrenteService = {
  listarTodos: async (usuarioId: number) => {
    const response = await api.get<TransacaoRecorrente[]>('/recorrentes', { params: { usuarioId } });
    return response.data;
  },
  criar: async (recorrente: TransacaoRecorrente) => {
    const response = await api.post<TransacaoRecorrente>('/recorrentes', recorrente);
    return response.data;
  },
  deletar: async (id: number) => {
    await api.delete(`/recorrentes/${id}`);
  }
};
