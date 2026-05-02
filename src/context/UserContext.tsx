import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usuarioService } from '../api/services/usuarioService';
import { categoriaService } from '../api/services/categoriaService';
import { perfilInvestidorService } from '../api/services/perfilInvestidorService';

// Tipagem para as Categorias no frontend
export type Category = {
  id: string; // no backend é number, vamos mapear
  name: string;
  icon: string;
  type: 'up' | 'down';
};

type UserContextType = {
  isAuthenticated: boolean;
  userId: number | null;
  userName: string;
  setUserName: (name: string) => void;
  userPhoto: string;
  setUserPhoto: (photo: string) => void;
  investorProfile: string;
  setInvestorProfile: (profile: string) => void;
  categories: Category[];
  login: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const INITIAL_CATEGORIES = [
  { name: 'Alimentação', icon: 'fast-food-outline', type: 'down' as const },
  { name: 'Transporte', icon: 'car-outline', type: 'down' as const },
  { name: 'Contas', icon: 'document-text-outline', type: 'down' as const },
  { name: 'Lazer', icon: 'game-controller-outline', type: 'down' as const },
  { name: 'Saúde', icon: 'medkit-outline', type: 'down' as const },
  { name: 'Outros', icon: 'ellipsis-horizontal-circle-outline', type: 'down' as const },
  { name: 'Salário', icon: 'cash-outline', type: 'up' as const },
  { name: 'Vendas', icon: 'pricetag-outline', type: 'up' as const },
  { name: 'Investimentos', icon: 'trending-up-outline', type: 'up' as const },
  { name: 'Pix', icon: 'phone-portrait-outline', type: 'up' as const },
  { name: 'Outros', icon: 'ellipsis-horizontal-circle-outline', type: 'up' as const },
];

const getIconByName = (name: string, type: 'up'|'down') => {
  const cat = INITIAL_CATEGORIES.find(c => c.name === name && c.type === type);
  return cat ? cat.icon : 'ellipsis-horizontal-circle-outline';
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState('Pacheco');
  const [userPhoto, setUserPhoto] = useState('https://github.com/shadcn.png');
  const [investorProfile, setInvestorProfile] = useState('Não definido');
  const [categories, setCategories] = useState<Category[]>([]);

  const login = async () => {
    try {
      let currentUserId: number;
      const storedId = await AsyncStorage.getItem('@usuarioId');

      if (storedId) {
        currentUserId = parseInt(storedId, 10);
        const user = await usuarioService.buscarPorId(currentUserId);
        setUserName(user.nome);
        
        try {
          const profile = await perfilInvestidorService.buscarPorUsuarioId(currentUserId);
          if (profile) setInvestorProfile(profile.tipoPerfil);
        } catch (e) {
          // não tem perfil ainda
        }
      } else {
        // Criar novo usuário na API
        const newUser = await usuarioService.criar({
          nome: 'Usuário',
          pinSeguranca: 'auth-local'
        });
        currentUserId = newUser.id!;
        await AsyncStorage.setItem('@usuarioId', currentUserId.toString());
        setUserName(newUser.nome);

        // Criar as categorias base para esse novo usuário no banco
        for (const cat of INITIAL_CATEGORIES) {
          await categoriaService.criar({
            nome: cat.name,
            tipo: cat.type,
            usuario: { id: currentUserId }
          });
        }
      }

      setUserId(currentUserId);

      // Buscar categorias do banco
      let apiCategories = await categoriaService.listarTodos(currentUserId);

      // Se as categorias vierem vazias (ex: deu erro na primeira criação), tenta criá-las de novo
      if (apiCategories.length === 0) {
        for (const cat of INITIAL_CATEGORIES) {
          await categoriaService.criar({
            nome: cat.name,
            tipo: cat.type,
            usuario: { id: currentUserId }
          });
        }
        apiCategories = await categoriaService.listarTodos(currentUserId);
      }
      const mappedCategories: Category[] = apiCategories.map(c => ({
        id: String(c.id),
        name: c.nome,
        type: c.tipo as 'up' | 'down',
        icon: getIconByName(c.nome, c.tipo as 'up' | 'down')
      }));
      
      setCategories(mappedCategories);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Erro no login/sincronização com backend:', error);
      throw error; // Repassa o erro para a tela de login se precisar
    }
  };

  const handleSetUserName = async (name: string) => {
    setUserName(name);
    if (userId) {
      try {
        await usuarioService.atualizar(userId, { nome: name, pinSeguranca: 'auth-local' });
      } catch (error) {
        console.error('Erro ao atualizar nome no backend', error);
      }
    }
  };

  const handleSetInvestorProfile = async (profile: string) => {
    setInvestorProfile(profile);
    if (userId) {
      try {
        // Verifica se já existe
        try {
          const existing = await perfilInvestidorService.buscarPorUsuarioId(userId);
          if (existing && existing.id) {
            await perfilInvestidorService.atualizar(existing.id, {
              tipoPerfil: profile,
              dataAnalise: new Date().toISOString(),
              usuario: { id: userId }
            });
            return;
          }
        } catch (e) {}

        // Se não existe, cria
        await perfilInvestidorService.criar({
          tipoPerfil: profile,
          dataAnalise: new Date().toISOString(),
          usuario: { id: userId }
        });
      } catch (error) {
        console.error('Erro ao salvar perfil de investidor', error);
      }
    }
  };

  const deleteAccount = async () => {
    if (userId) {
      try {
        await usuarioService.deletar(userId);
        await AsyncStorage.removeItem('@usuarioId');
        setIsAuthenticated(false);
        setUserId(null);
        setCategories([]);
      } catch (error) {
        console.error('Erro ao excluir conta', error);
      }
    }
  };

  return (
    <UserContext.Provider value={{ 
      isAuthenticated,
      userId,
      userName, 
      setUserName: handleSetUserName, 
      userPhoto, 
      setUserPhoto, 
      investorProfile, 
      setInvestorProfile: handleSetInvestorProfile,
      categories, 
      login,
      deleteAccount
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
}