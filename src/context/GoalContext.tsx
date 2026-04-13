import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define o molde de um Cofrinho
export type Goal = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  color: string;
};

// Define o que este cofre sabe fazer
type GoalContextType = {
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updatedGoal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addMoney: (id: string, amount: number) => void;
  removeMoney: (id: string, amount: number) => void;
};

const GoalContext = createContext<GoalContextType | undefined>(undefined);

// O Guarda do Cofre
export function GoalProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const stored = await AsyncStorage.getItem('@goals');
        if (stored) {
          setGoals(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Erro ao carregar metas:', error);
      }
    };
    loadGoals();
  }, []);

  const persistGoals = async (newGoals: Goal[]) => {
    setGoals(newGoals);
    try {
      await AsyncStorage.setItem('@goals', JSON.stringify(newGoals));
    } catch (error) {
      console.error('Erro ao salvar metas:', error);
    }
  };

  const addGoal = (goal: Goal) => {
    persistGoals([...goals, goal]);
  };

  const updateGoal = (id: string, updatedGoal: Partial<Goal>) => {
    persistGoals(goals.map(g => g.id === id ? { ...g, ...updatedGoal } : g));
  };

  const deleteGoal = (id: string) => {
    persistGoals(goals.filter(g => g.id !== id));
  };

  const addMoney = (id: string, amount: number) => {
    persistGoals(goals.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g));
  };

  const removeMoney = (id: string, amount: number) => {
    persistGoals(goals.map(g => g.id === id ? { ...g, currentAmount: Math.max(0, g.currentAmount - amount) } : g));
  };

  return (
    <GoalContext.Provider value={{ goals, addGoal, updateGoal, deleteGoal, addMoney, removeMoney }}>
      {children}
    </GoalContext.Provider>
  );
}

// Hook para usar noutros ecrãs
export function useGoals() {
  const context = useContext(GoalContext);
  if (!context) {
    throw new Error('useGoals deve ser usado dentro de um GoalProvider');
  }
  return context;
}