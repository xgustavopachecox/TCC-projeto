import api from '../api';
import { Usuario } from './usuarioService';

export interface Categoria {
  id?: number;
  nome: string;
  tipo: string;
  usuario: { id: number }; // Referência
}

export const categoriaService = {
  listarTodos: async (usuarioId?: number) => {
    const params = usuarioId ? { usuarioId } : {};
    const response = await api.get<Categoria[]>('/categorias', { params });
    return response.data;
  },
  buscarPorId: async (id: number) => {
    const response = await api.get<Categoria>(`/categorias/${id}`);
    return response.data;
  },
  criar: async (categoria: Categoria) => {
    const response = await api.post<Categoria>('/categorias', categoria);
    return response.data;
  },
  atualizar: async (id: number, categoria: Categoria) => {
    const response = await api.put<Categoria>(`/categorias/${id}`, categoria);
    return response.data;
  },
  deletar: async (id: number) => {
    await api.delete(`/categorias/${id}`);
  }
};
