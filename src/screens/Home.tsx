import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Tipagem simples para nossas transações fictícias
type Transaction = {
  id: string;
  title: string;
  type: 'up' | 'down'; // up = receita, down = despesa
  amount: string;
  category: string;
  date: string;
};

// Dados fictícios para visualizar a lista
const RECENT_TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'Salário Mensal', type: 'up', amount: 'R$ 5.000,00', category: 'Trabalho', date: '05 Nov' },
  { id: '2', title: 'Supermercado', type: 'down', amount: 'R$ 450,00', category: 'Alimentação', date: '07 Nov' },
  { id: '3', title: 'Netflix', type: 'down', amount: 'R$ 55,90', category: 'Lazer', date: '10 Nov' },
  { id: '4', title: 'Freelance', type: 'up', amount: 'R$ 800,00', category: 'Extra', date: '12 Nov' },
];

export default function Home() {
  const [currentMonth, setCurrentMonth] = useState('NOV/2025');

  return (
    <View style={styles.container}>
      
      {/* --- CABEÇALHO (HEADER) --- */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Olá, Pacheco</Text>
            <Text style={styles.subGreeting}>Rumo à liberdade financeira!</Text>
          </View>
          
          <TouchableOpacity style={styles.profileButton}>
            <Image 
              source={{ uri: 'https://github.com/shadcn.png' }} 
              style={styles.avatar} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- CONTEÚDO COM SCROLL --- */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }} // Espaço extra p/ não cobrir o menu
      >
        
        {/* CARD DE SALDO PRINCIPAL */}
        <View style={styles.balanceCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.balanceLabel}>Saldo Total</Text>
            <TouchableOpacity style={styles.filterPill}>
              <Text style={styles.filterText}>{currentMonth}</Text>
              <Ionicons name="chevron-down" size={12} color="#6200ee" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.balanceValue}>R$ 3.450,00</Text>

          <View style={styles.separator} />

          <View style={styles.rowSummary}>
             <View style={styles.summaryItem}>
                <View style={[styles.iconBg, { backgroundColor: '#e8f5e9' }]}>
                  <Ionicons name="arrow-up" size={18} color="#27ae60" />
                </View>
                <View>
                  <Text style={styles.summaryLabel}>Entradas</Text>
                  <Text style={styles.summaryValueUp}>R$ 5.800,00</Text>
                </View>
             </View>

             <View style={styles.summaryItem}>
                <View style={[styles.iconBg, { backgroundColor: '#ffebee' }]}>
                  <Ionicons name="arrow-down" size={18} color="#e74c3c" />
                </View>
                <View>
                  <Text style={styles.summaryLabel}>Saídas</Text>
                  <Text style={styles.summaryValueDown}>R$ 2.350,00</Text>
                </View>
             </View>
          </View>
        </View>

        {/* ÁREA DO GRÁFICO (Placeholder Visual) */}
        <Text style={styles.sectionTitle}>Análise Mensal</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartCircle}>
            <Text style={styles.chartPercent}>65%</Text>
            <Text style={styles.chartLabel}>Gastos</Text>
          </View>
          <View style={styles.chartLegend}>
             <View style={styles.legendItem}>
               <View style={[styles.dot, {backgroundColor: '#6200ee'}]} />
               <Text style={styles.legendText}>Essenciais</Text>
             </View>
             <View style={styles.legendItem}>
               <View style={[styles.dot, {backgroundColor: '#ffb74d'}]} />
               <Text style={styles.legendText}>Lazer</Text>
             </View>
             <View style={styles.legendItem}>
               <View style={[styles.dot, {backgroundColor: '#26c6da'}]} />
               <Text style={styles.legendText}>Investimentos</Text>
             </View>
          </View>
        </View>

        {/* LISTA DE TRANSAÇÕES RECENTES */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recentes</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver tudo</Text>
          </TouchableOpacity>
        </View>

        {RECENT_TRANSACTIONS.map((item) => (
          <View key={item.id} style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
              <View style={styles.categoryIcon}>
                <Ionicons 
                  name={item.type === 'up' ? "cash-outline" : "cart-outline"} 
                  size={20} 
                  color="#555" 
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
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7' },
  
  // Header Roxo
  header: {
    backgroundColor: '#6200ee',
    height: 180, // Altura fixa para criar o fundo
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  subGreeting: { color: '#E0E0E0', fontSize: 14, marginTop: 4 },
  profileButton: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 30,
  },
  avatar: { width: 50, height: 50, borderRadius: 25 },

  // ScrollView
  content: { flex: 1, paddingHorizontal: 20, marginTop: -60 }, // Sobe por cima do header

  // Card de Saldo
  balanceCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 25,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  balanceLabel: { color: '#888', fontSize: 14, fontWeight: '500' },
  filterPill: {
    flexDirection: 'row',
    backgroundColor: '#ede7f6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignItems: 'center',
    gap: 5,
  },
  filterText: { color: '#6200ee', fontSize: 12, fontWeight: 'bold' },
  balanceValue: { fontSize: 36, fontWeight: 'bold', color: '#333' },
  
  separator: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  
  rowSummary: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: '#888' },
  summaryValueUp: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  summaryValueDown: { fontSize: 16, fontWeight: 'bold', color: '#333' },

  // Seções e Títulos
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  
  // Placeholder do Gráfico
  chartCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 2,
  },
  chartCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 10,
    borderColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPercent: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  chartLabel: { fontSize: 10, color: '#888' },
  chartLegend: { gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 14, color: '#555' },

  // Lista de Transações
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  seeAll: { color: '#6200ee', fontWeight: 'bold' },
  transactionItem: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 1,
  },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  categoryIcon: {
    width: 45,
    height: 45,
    backgroundColor: '#F0F2F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionTitle: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  transactionCategory: { color: '#999', fontSize: 12, marginTop: 2 },
  transactionAmount: { fontWeight: 'bold', fontSize: 15 },

  fabContainer: { // O nome do estilo do seu botão redondo
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#IssoÉUmaCor',

    // 👇 ADICIONE ESTAS DUAS LINHAS AQUI 👇
    justifyContent: 'center',
    alignItems: 'center',
    // 👆 ------------------------------- 👆
    
    elevation: 5, // Sombra no Android
    shadowColor: '#000', // Sombra no iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
