import React, { createContext, useState, useContext, ReactNode } from 'react';

// Tipagem para Categorias
export type Category = {
  id: string;
  name: string;
  icon: string;
  type: 'up' | 'down';
};

type UserContextType = {
  userName: string;
  setUserName: (name: string) => void;
  userPhoto: string;
  setUserPhoto: (photo: string) => void;
  investorProfile: string; // "Não definido", "Conservador", etc.
  categories: Category[];
  addCategory: (cat: Category) => void;
};

const INITIAL_CATEGORIES: Category[] = [
  { id: 'e1', name: 'Alimentação', icon: 'fast-food-outline', type: 'down' },
  { id: 'e2', name: 'Transporte', icon: 'car-outline', type: 'down' },
  { id: 'i1', name: 'Salário', icon: 'cash-outline', type: 'up' },
  { id: 'i2', name: 'Pix', icon: 'phone-portrait-outline', type: 'up' },
];

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState('Pacheco');
  const [userPhoto, setUserPhoto] = useState('https://github.com/shadcn.png');
  const [investorProfile, setInvestorProfile] = useState('Não definido');
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);

  const addCategory = (cat: Category) => {
    setCategories([...categories, cat]);
  };

  return (
    <UserContext.Provider value={{ 
      userName, setUserName, 
      userPhoto, setUserPhoto, 
      investorProfile, 
      categories, addCategory 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser deve ser usado dentro de um UserProvider');
  return context;
}