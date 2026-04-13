import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tipagem para as Categorias
export type Category = {
  id: string;
  name: string;
  icon: string;
  type: 'up' | 'down';
};

// Estrutura do nosso Cofre
type UserContextType = {
  userName: string;
  setUserName: (name: string) => void;
  userPhoto: string;
  setUserPhoto: (photo: string) => void;
  investorProfile: string;
  setInvestorProfile: (profile: string) => void;
  categories: Category[];
  addCategory: (cat: Category) => void;
};

// Categorias iniciais expandidas conforme o código existente nas telas
const INITIAL_CATEGORIES: Category[] = [
  // Categorias de Saída (down)
  { id: 'e1', name: 'Alimentação', icon: 'fast-food-outline', type: 'down' },
  { id: 'e2', name: 'Transporte', icon: 'car-outline', type: 'down' },
  { id: 'e3', name: 'Contas', icon: 'document-text-outline', type: 'down' },
  { id: 'e4', name: 'Lazer', icon: 'game-controller-outline', type: 'down' },
  { id: 'e5', name: 'Saúde', icon: 'medkit-outline', type: 'down' },
  { id: 'e6', name: 'Outros', icon: 'ellipsis-horizontal-circle-outline', type: 'down' },
  // Categorias de Entrada (up)
  { id: 'i1', name: 'Salário', icon: 'cash-outline', type: 'up' },
  { id: 'i2', name: 'Vendas', icon: 'pricetag-outline', type: 'up' },
  { id: 'i3', name: 'Investimentos', icon: 'trending-up-outline', type: 'up' },
  { id: 'i4', name: 'Pix', icon: 'phone-portrait-outline', type: 'up' },
  { id: 'i5', name: 'Outros', icon: 'ellipsis-horizontal-circle-outline', type: 'up' },
];

// Criação do Contexto
const UserContext = createContext<UserContextType | undefined>(undefined);

// O Componente que vai "embrulhar" a aplicação e guardar os estados
export function UserProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState('Pacheco');
  const [userPhoto, setUserPhoto] = useState('https://github.com/shadcn.png');
  const [investorProfile, setInvestorProfile] = useState('Não definido');
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedName = await AsyncStorage.getItem('@userName');
        if (storedName) setUserName(storedName);

        const storedProfile = await AsyncStorage.getItem('@investorProfile');
        if (storedProfile) setInvestorProfile(storedProfile);

        const storedCategories = await AsyncStorage.getItem('@categories');
        if (storedCategories) {
          setCategories(JSON.parse(storedCategories));
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };
    loadUserData();
  }, []);

  const addCategory = async (cat: Category) => {
    const newCategories = [...categories, cat];
    setCategories(newCategories);
    try {
      await AsyncStorage.setItem('@categories', JSON.stringify(newCategories));
    } catch (error) {
      console.error('Erro ao salvar categorias:', error);
    }
  };

  const handleSetUserName = async (name: string) => {
    setUserName(name);
    try {
      await AsyncStorage.setItem('@userName', name);
    } catch (error) {}
  };

  const handleSetInvestorProfile = async (profile: string) => {
    setInvestorProfile(profile);
    try {
      await AsyncStorage.setItem('@investorProfile', profile);
    } catch (error) {}
  };

  return (
    <UserContext.Provider value={{ 
      userName, 
      setUserName: handleSetUserName, 
      userPhoto, 
      setUserPhoto, 
      investorProfile, 
      setInvestorProfile: handleSetInvestorProfile,
      categories, 
      addCategory 
    }}>
      {children}
    </UserContext.Provider>
  );
}

// O Hook (A ferramenta mágica) que os outros ecrãs vão usar para ir buscar os dados
export function useUser() {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  
  return context;
}