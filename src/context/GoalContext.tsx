import React, { createContext, useState, useContext, ReactNode } from 'react';

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
  // Começamos com zero cofrinhos reais
  const [goals, setGoals] = useState<Goal[]>([]);

  const addGoal = (goal: Goal) => {
    setGoals([...goals, goal]);
  };

  const updateGoal = (id: string, updatedGoal: Partial<Goal>) => {
    setGoals(goals.map(g => g.id === id ? { ...g, ...updatedGoal } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const addMoney = (id: string, amount: number) => {
    setGoals(goals.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g));
  };

  const removeMoney = (id: string, amount: number) => {
    setGoals(goals.map(g => g.id === id ? { ...g, currentAmount: Math.max(0, g.currentAmount - amount) } : g));
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