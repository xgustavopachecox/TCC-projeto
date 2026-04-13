import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define como é o "molde" de uma transação
export type Transaction = {
  id: string;
  title: string;
  type: 'up' | 'down';
  amount: string;
  category: string;
  date: string;
  time: string;
  description: string;
};

// Define o que o nosso Cofre vai ter lá dentro
type TransactionContextType = {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
};

// Cria o Cofre vazio
const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// Cria o "Guarda" do Cofre (Provider)
export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Carrega as transações do AsyncStorage ao iniciar
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const stored = await AsyncStorage.getItem('@transactions');
        if (stored) {
          setTransactions(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
      }
    };
    loadTransactions();
  }, []);

  const persistTransactions = async (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    try {
      await AsyncStorage.setItem('@transactions', JSON.stringify(newTransactions));
    } catch (error) {
      console.error('Erro ao salvar transações:', error);
    }
  };

  // Função para adicionar dinheiro/gasto
  const addTransaction = (tx: Transaction) => {
    persistTransactions([tx, ...transactions]); // Coloca a nova no início da lista
  };

  // Função para apagar
  const deleteTransaction = (id: string) => {
    persistTransactions(transactions.filter(t => t.id !== id));
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, deleteTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
}

// Hook para facilitar o uso nos outros ecrãs
export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions deve ser usado dentro de um TransactionProvider');
  }
  return context;
}