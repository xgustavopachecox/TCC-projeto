import React, { createContext, useState, useContext, ReactNode } from 'react';

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
  // Começamos com uma lista VAZIA (sem dados falsos!)
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Função para adicionar dinheiro/gasto
  const addTransaction = (tx: Transaction) => {
    setTransactions([tx, ...transactions]); // Coloca a nova no início da lista
  };

  // Função para apagar
  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
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