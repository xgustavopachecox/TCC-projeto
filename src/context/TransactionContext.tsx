import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { transacaoService } from '../api/services/transacaoService';
import { useUser } from './UserContext';

export type Transaction = {
  id: string;
  title: string;
  type: 'up' | 'down';
  amount: string;
  category: string; // no frontend esse costuma ser o ID local da categoria (ex: 'e1') mas agora é o ID do banco em string
  date: string;
  time: string;
  description: string;
};

type TransactionContextType = {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
};

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

const formatToBRL = (val: number) => {
  let str = val.toFixed(2);
  str = str.replace('.', ',');
  str = str.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  return str;
};

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { userId, categories } = useUser();

  useEffect(() => {
    const loadTransactions = async () => {
      if (!userId) return;
      try {
        const apiTransacoes = await transacaoService.listarTodos(userId);
        
        // Mapear Transacao (Backend) -> Transaction (Frontend)
        const mappedTransactions: Transaction[] = apiTransacoes.map(t => {
          // Vamos tentar achar o nome da categoria usando a lista do UserContext
          const categoryObj = t.categoria ? categories.find(c => c.id === String(t.categoria.id)) : null;
          const categoryName = categoryObj ? categoryObj.name : 'Excluída';

          // A API tem apenas data e descricao, o frontend separa data e hora se quiser,
          // ou a data salva no BD já tem isso? O frontend salva "date" e "time". 
          // Vamos assumir que a data do BD pode conter ou não a hora, ou usamos o campo "descricao" para armazenar o resto se não foi feito antes.
          // Para não quebrar o layout, vamos preencher os campos.
          
          return {
            id: String(t.id),
            title: t.descricao || categoryName, // Mostra a descrição do usuário, ou o nome da categoria como fallback
            type: t.tipo as 'up' | 'down',
            amount: formatToBRL(t.valor),
            category: categoryName, // Exibe o nome da categoria, e não o ID
            date: t.data,
            time: '12:00', // Mock de hora, caso precise
            description: t.descricao || '',
          };
        });

        // Ordenar as mais recentes primeiro, se quiser
        setTransactions(mappedTransactions.reverse());
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
      }
    };
    
    loadTransactions();
  }, [userId, categories]);

  const addTransaction = async (tx: Transaction) => {
    if (!userId) return;
    try {
      const novaTransacaoApi = await transacaoService.criar({
        tipo: tx.type,
        valor: parseFloat(tx.amount.replace('R$', '').replace('.', '').replace(',', '.')),
        data: tx.date,
        descricao: tx.description,
        usuario: { id: userId },
        categoria: { id: parseInt(tx.category, 10) }
      });

      // Mapear de volta para colocar no array sem precisar fazer reload
      const categoryObj = categories.find(c => c.id === String(novaTransacaoApi.categoria.id));
      const categoryName = categoryObj ? categoryObj.name : 'Outros';

      const novaTxFront: Transaction = {
        id: String(novaTransacaoApi.id),
        title: novaTransacaoApi.descricao || categoryName,
        type: novaTransacaoApi.tipo as 'up' | 'down',
        amount: formatToBRL(novaTransacaoApi.valor),
        category: categoryName,
        date: novaTransacaoApi.data,
        time: tx.time,
        description: novaTransacaoApi.descricao || '',
      };

      setTransactions([novaTxFront, ...transactions]);
    } catch (error) {
      console.error('Erro ao adicionar transação na API', error);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await transacaoService.deletar(parseInt(id, 10));
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) {
      console.error('Erro ao deletar transação na API', error);
    }
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, deleteTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions deve ser usado dentro de um TransactionProvider');
  }
  return context;
}