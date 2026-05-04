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
  userBirthDate: string;
  setUserBirthDate: (date: string) => void;
  userSalary: string;
  setUserSalary: (salary: string) => void;
  userPhoto: string;
  setUserPhoto: (photo: string) => void;
  updateUserProfile: (data: { nome?: string, dataNascimento?: string, salarioAtual?: string, photoUrl?: string }) => Promise<void>;
  investorProfile: string;
  setInvestorProfile: (profile: string) => void;
  categories: Category[];
  login: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  isFirstAccess: boolean;
  setIsFirstAccess: (val: boolean) => void;
  isLoading: boolean;
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
  const [userBirthDate, setUserBirthDate] = useState('');
  const [userSalary, setUserSalary] = useState('');
  const [userPhoto, setUserPhoto] = useState('');
  const [investorProfile, setInvestorProfile] = useState('Não definido');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFirstAccess, setIsFirstAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkInitialState = async () => {
      const storedId = await AsyncStorage.getItem('@usuarioId');
      if (!storedId) {
        // Primeiro acesso real (sem conta local)
        // Auto-login para ir direto ao Welcome
        await login();
      }
      setIsLoading(false);
    };
    checkInitialState();
  }, []);

  const login = async () => {
    try {
      let currentUserId: number;
      const storedId = await AsyncStorage.getItem('@usuarioId');

      if (storedId) {
        currentUserId = parseInt(storedId, 10);
        const user = await usuarioService.buscarPorId(currentUserId);
        setUserName(user.nome);
        if (user.dataNascimento) setUserBirthDate(user.dataNascimento);
        if (user.salarioAtual) setUserSalary(String(user.salarioAtual));
        
        const savedPhoto = await AsyncStorage.getItem(`@userPhoto_${currentUserId}`);
        if (savedPhoto) setUserPhoto(savedPhoto);
        
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
        setUserPhoto('');
        setIsFirstAccess(true); // Indica que é a primeira vez

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

  const updateUserProfile = async (data: { nome?: string, dataNascimento?: string, salarioAtual?: string, photoUrl?: string }) => {
    if (data.nome !== undefined) setUserName(data.nome);
    if (data.dataNascimento !== undefined) setUserBirthDate(data.dataNascimento);
    if (data.salarioAtual !== undefined) setUserSalary(data.salarioAtual);
    if (data.photoUrl !== undefined) {
      setUserPhoto(data.photoUrl);
      if (userId) {
        if (data.photoUrl === '') {
          AsyncStorage.removeItem(`@userPhoto_${userId}`);
        } else {
          AsyncStorage.setItem(`@userPhoto_${userId}`, data.photoUrl);
        }
      }
    }

    if (userId) {
      try {
        const payload = {
          nome: data.nome !== undefined ? data.nome : userName,
          pinSeguranca: 'auth-local',
          dataNascimento: data.dataNascimento !== undefined ? data.dataNascimento : userBirthDate,
          salarioAtual: data.salarioAtual !== undefined ? (data.salarioAtual ? parseFloat(data.salarioAtual) : undefined) : (userSalary ? parseFloat(userSalary) : undefined)
        };
        await usuarioService.atualizar(userId, payload);
      } catch (error) {
        console.error('Erro ao atualizar perfil no backend', error);
      }
    }
  };

  const handleSetUserName = async (name: string) => {
    setUserName(name);
  };

  const handleSetUserBirthDate = async (date: string) => {
    setUserBirthDate(date);
  };

  const handleSetUserSalary = async (salary: string) => {
    setUserSalary(salary);
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
        await AsyncStorage.removeItem(`@userPhoto_${userId}`);
        await AsyncStorage.removeItem(`@agreedToAIDisclaimer_${userId}`);
        setIsAuthenticated(false);
        setIsFirstAccess(false);
        setUserId(null);
        setCategories([]);
        setUserBirthDate('');
        setUserSalary('');
        setInvestorProfile('Não definido');
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
      userBirthDate,
      setUserBirthDate: handleSetUserBirthDate,
      userSalary,
      setUserSalary: handleSetUserSalary,
      userPhoto, 
      setUserPhoto, 
      updateUserProfile,
      investorProfile, 
      setInvestorProfile: handleSetInvestorProfile,
      categories, 
      login,
      deleteAccount,
      isFirstAccess,
      setIsFirstAccess,
      isLoading
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