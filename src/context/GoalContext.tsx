import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { metaService } from '../api/services/metaService';
import { useUser } from './UserContext';

// Define o molde de um Cofrinho (Frontend)
export type Goal = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  color: string;
};

type GoalContextType = {
  goals: Goal[];
  addGoal: (goal: Goal) => Promise<void>;
  updateGoal: (id: string, updatedGoal: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addMoney: (id: string, amount: number) => Promise<void>;
  removeMoney: (id: string, amount: number) => Promise<void>;
};

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export function GoalProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const { userId } = useUser();

  const PRIMARY_COLOR = '#6200ee';

  useEffect(() => {
    const loadGoals = async () => {
      if (!userId) return;
      try {
        const apiMetas = await metaService.listarTodos(userId);
        
        const mappedGoals: Goal[] = apiMetas.map(m => ({
          id: String(m.id),
          title: m.nome,
          targetAmount: m.valorAlvo,
          currentAmount: m.valorAtual || 0,
          icon: 'star-outline', // genérico conforme solicitado
          color: PRIMARY_COLOR,  // genérico
        }));

        setGoals(mappedGoals);
      } catch (error) {
        console.error('Erro ao carregar metas:', error);
      }
    };
    loadGoals();
  }, [userId]);

  const addGoal = async (goal: Goal) => {
    if (!userId) return;
    try {
      const novaMetaApi = await metaService.criar({
        nome: goal.title,
        valorAlvo: goal.targetAmount,
        valorAtual: goal.currentAmount,
        prazo: '31/12/2099', // Frontend atual não pede prazo
        usuario: { id: userId }
      });

      const novaMetaFront: Goal = {
        id: String(novaMetaApi.id),
        title: novaMetaApi.nome,
        targetAmount: novaMetaApi.valorAlvo,
        currentAmount: novaMetaApi.valorAtual || 0,
        icon: 'star-outline',
        color: PRIMARY_COLOR
      };

      setGoals([...goals, novaMetaFront]);
    } catch (error) {
      console.error('Erro ao adicionar meta na API', error);
    }
  };

  const updateGoal = async (id: string, updatedGoal: Partial<Goal>) => {
    if (!userId) return;
    try {
      const targetGoal = goals.find(g => g.id === id);
      if (!targetGoal) return;

      const updatedTitle = updatedGoal.title !== undefined ? updatedGoal.title : targetGoal.title;
      const updatedTargetAmount = updatedGoal.targetAmount !== undefined ? updatedGoal.targetAmount : targetGoal.targetAmount;
      const updatedCurrentAmount = updatedGoal.currentAmount !== undefined ? updatedGoal.currentAmount : targetGoal.currentAmount;

      await metaService.atualizar(parseInt(id, 10), {
        nome: updatedTitle,
        valorAlvo: updatedTargetAmount,
        valorAtual: updatedCurrentAmount,
        prazo: '31/12/2099',
        usuario: { id: userId }
      });

      setGoals(goals.map(g => g.id === id ? { ...g, ...updatedGoal } : g));
    } catch (error) {
      console.error('Erro ao atualizar meta na API', error);
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await metaService.deletar(parseInt(id, 10));
      setGoals(goals.filter(g => g.id !== id));
    } catch (error) {
      console.error('Erro ao deletar meta na API', error);
    }
  };

  const addMoney = async (id: string, amount: number) => {
    const targetGoal = goals.find(g => g.id === id);
    if (!targetGoal) return;
    
    await updateGoal(id, { currentAmount: targetGoal.currentAmount + amount });
  };

  const removeMoney = async (id: string, amount: number) => {
    const targetGoal = goals.find(g => g.id === id);
    if (!targetGoal) return;
    
    await updateGoal(id, { currentAmount: Math.max(0, targetGoal.currentAmount - amount) });
  };

  return (
    <GoalContext.Provider value={{ goals, addGoal, updateGoal, deleteGoal, addMoney, removeMoney }}>
      {children}
    </GoalContext.Provider>
  );
}

export function useGoals() {
  const context = useContext(GoalContext);
  if (!context) {
    throw new Error('useGoals deve ser usado dentro de um GoalProvider');
  }
  return context;
}