import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Definição do tipo da transação
type Transaction = {
  id: string;
  title: string;
  type: 'up' | 'down';
  amount: string;
  category: string;
  date: string;
};

// Dados de exemplo (Mock Data)
const ALL_TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'Salário Mensal', type: 'up', amount: 'R$ 5.000,00', category: 'Trabalho', date: '05 Nov' },
  { id: '2', title: 'Supermercado', type: 'down', amount: 'R$ 450,00', category: 'Alimentação', date: '07 Nov' },
  { id: '3', title: 'Netflix', type: 'down', amount: 'R$ 55,90', category: 'Lazer', date: '10 Nov' },
  { id: '4', title: 'Freelance', type: 'up', amount: 'R$ 800,00', category: 'Extra', date: '12 Nov' },
  { id: '5', title: 'Uber', type: 'down', amount: 'R$ 24,90', category: 'Transporte', date: '13 Nov' },
  { id: '6', title: 'Spotify', type: 'down', amount: 'R$ 19,90', category: 'Lazer', date: '15 Nov' },
  { id: '7', title: 'Aluguel', type: 'down', amount: 'R$ 1.200,00', category: 'Moradia', date: '15 Nov' },
  { id: '8', title: 'Venda Teclado', type: 'up', amount: 'R$ 150,00', category: 'Vendas', date: '18 Nov' },
  { id: '9', title: 'Burger King', type: 'down', amount: 'R$ 45,00', category: 'Alimentação', date: '19 Nov' },
  { id: '10', title: 'Posto Shell', type: 'down', amount: 'R$ 200,00', category: 'Transporte', date: '20 Nov' },
  { id: '11', title: 'Internet', type: 'down', amount: 'R$ 120,00', category: 'Contas', date: '21 Nov' },
  { id: '12', title: 'Pix Recebido', type: 'up', amount: 'R$ 50,00', category: 'Outros', date: '22 Nov' },
];

export default function Wallet() {
  const [filter, setFilter] = useState<'all' | 'up' | 'down'>('all');

  // Lógica para filtrar a lista
  const filteredData = ALL_TRANSACTIONS.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  // Renderização de cada item da lista
  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={[
          styles.categoryIcon, 
          { backgroundColor: item.type === 'up' ? '#e8f5e9' : '#ffebee' }
        ]}>
          <Ionicons 
            name={item.type === 'up' ? "arrow-up" : "arrow-down"} 
            size={20} 
            color={item.type === 'up' ? "#27ae60" : "#e74c3c"} 
          />
        </View>
        <View>
          <Text style={styles.transactionTitle}>{item.title}</Text>
          <Text style={styles.transactionCategory}>{item.category} • {item.date}</Text>
        </View>
      </View>
      <Text style={[
        styles.transactionAmount, 
        { color: item.type === 'up' ? '#27ae60' : '#e74c3c' }
      ]}>
        {item.type === 'up' ? '+' : '-'}{item.amount}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Extrato</Text>
        <TouchableOpacity>
           <Ionicons name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Botões de Filtro */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]} 
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Tudo</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'up' && styles.filterBtnActive]} 
          onPress={() => setFilter('up')}
        >
          <Text style={[styles.filterText, filter === 'up' && styles.filterTextActive]}>Entradas</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'down' && styles.filterBtnActive]} 
          onPress={() => setFilter('down')}
        >
          <Text style={[styles.filterText, filter === 'down' && styles.filterTextActive]}>Saídas</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F2F4F7', 
    paddingTop: 60 // Espaço para StatusBar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  
  // Estilos dos Filtros
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterBtnActive: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  filterText: { 
    color: '#666', 
    fontWeight: '600' 
  },
  filterTextActive: { 
    color: '#FFF' 
  },

  // Estilos da Lista
  listContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 100 // Margem em baixo para não ficar atrás da TabBar
  },
  transactionItem: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    
    // Sombra
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  transactionLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 15 
  },
  categoryIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionTitle: { 
    fontWeight: 'bold', 
    fontSize: 15, 
    color: '#333' 
  },
  transactionCategory: { 
    color: '#999', 
    fontSize: 12, 
    marginTop: 2 
  },
  transactionAmount: { 
    fontWeight: 'bold', 
    fontSize: 15 
  },
});