import api from '../api';

export interface Usuario {
  id?: number;
  nome: string;
  pinSeguranca: string;
}

export const usuarioService = {
  listarTodos: async () => {
    const response = await api.get<Usuario[]>('/usuarios');
    return response.data;
  },
  buscarPorId: async (id: number) => {
    const response = await api.get<Usuario>(`/usuarios/${id}`);
    return response.data;
  },
  criar: async (usuario: Usuario) => {
    const response = await api.post<Usuario>('/usuarios', usuario);
    return response.data;
  },
  atualizar: async (id: number, usuario: Usuario) => {
    const response = await api.put<Usuario>(`/usuarios/${id}`, usuario);
    return response.data;
  },
  deletar: async (id: number) => {
    await api.delete(`/usuarios/${id}`);
  }
};
