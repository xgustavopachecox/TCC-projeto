import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Modal,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Transaction = {
  id: string;
  title: string;
  type: 'up' | 'down'; 
  amount: string;
  category: string;
  date: string;
  time: string;
  description: string;
};

// Dados Iniciais
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'Salário Mensal', type: 'up', amount: '5.000,00', category: 'Trabalho', date: '05 Nov', time: '09:00', description: 'Pagamento de salário.' },
  { id: '2', title: 'Supermercado', type: 'down', amount: '450,00', category: 'Alimentação', date: '07 Nov', time: '18:30', description: 'Compras no supermercado.' },
  { id: '3', title: 'Netflix', type: 'down', amount: '55,90', category: 'Lazer', date: '10 Nov', time: '10:15', description: 'Assinatura mensal.' },
  { id: '4', title: 'Freelance', type: 'up', amount: '800,00', category: 'Extra', date: '12 Nov', time: '14:00', description: 'Serviço prestado.' },
];

export default function Home() {
  const navigation = useNavigation<any>();
  const [currentMonth, setCurrentMonth] = useState('NOV/2025');

  // Estados para as Transações Recentes e Modal
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Cores consistentes
  const GREEN_COLOR = '#27ae60';
  const RED_COLOR = '#e74c3c';

  // ==========================================
  // FUNÇÕES DO MODAL
  // ==========================================
  const openDetails = (tx: Transaction) => {
    setSelectedTx(tx);
    setModalVisible(true);
  };

  const closeDetails = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedTx(null), 300);
  };

  const handleDeleteTransaction = () => {
    if (selectedTx) {
      setRecentTransactions(prev => prev.filter(t => t.id !== selectedTx.id));
      closeDetails();
    }
  };

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
        contentContainerStyle={{ paddingBottom: 100 }}
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

        {/* ÁREA DO GRÁFICO */}
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
          <TouchableOpacity onPress={() => navigation.navigate('Extrato')}>
            <Text style={styles.seeAll}>Ver tudo</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.transactionItem}
            activeOpacity={0.7}
            onPress={() => openDetails(item)} // ABRE O MODAL DIRETAMENTE AQUI
          >
            <View style={styles.transactionLeft}>
              <View style={[
                styles.categoryIcon, 
                { backgroundColor: item.type === 'up' ? '#e8f5e9' : '#ffebee' }
              ]}>
                <Ionicons 
                  name={item.type === 'up' ? "arrow-up" : "arrow-down"} 
                  size={20} 
                  color={item.type === 'up' ? GREEN_COLOR : RED_COLOR} 
                />
              </View>
              <View>
                <Text style={styles.transactionTitle}>{item.title}</Text>
                <Text style={styles.transactionCategory}>{item.category} • {item.date}</Text>
              </View>
            </View>
            <Text style={[
              styles.transactionAmount, 
              { color: item.type === 'up' ? GREEN_COLOR : RED_COLOR }
            ]}>
              {item.type === 'up' ? '+ R$ ' : '- R$ '}{item.amount}
            </Text>
          </TouchableOpacity>
        ))}

      </ScrollView>

      {/* =================================================== */}
      {/* MODAL DE DETALHES DA TRANSAÇÃO (Direto na Home) */}
      {/* =================================================== */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDetails}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeDetails} />
          
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />

            {selectedTx && (
              <>
                {/* Cabeçalho do Modal */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalTxInfo}>
                    <View style={[
                      styles.modalIconBg, 
                      { backgroundColor: selectedTx.type === 'up' ? '#e8f5e9' : '#ffebee' }
                    ]}>
                      <Ionicons 
                        name={selectedTx.type === 'up' ? "arrow-up" : "arrow-down"} 
                        size={28} 
                        color={selectedTx.type === 'up' ? GREEN_COLOR : RED_COLOR} 
                      />
                    </View>
                    <Text style={styles.modalTxTitle}>{selectedTx.title}</Text>
                  </View>
                  <TouchableOpacity onPress={closeDetails} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#999" />
                  </TouchableOpacity>
                </View>

                {/* Valor em Destaque */}
                <View style={styles.modalAmountContainer}>
                  <Text style={[
                    styles.modalBigAmount,
                    { color: selectedTx.type === 'up' ? GREEN_COLOR : RED_COLOR }
                  ]}>
                    {selectedTx.type === 'up' ? '+ R$ ' : '- R$ '}{selectedTx.amount}
                  </Text>
                  <Text style={styles.modalStatusText}>
                    <Ionicons name="checkmark-circle" size={14} color={GREEN_COLOR} /> Concluído
                  </Text>
                </View>

                {/* Lista de Detalhes */}
                <View style={styles.detailsBox}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Categoria</Text>
                    <Text style={styles.detailValue}>{selectedTx.category}</Text>
                  </View>
                  <View style={styles.detailDivider} />
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Data</Text>
                    <Text style={styles.detailValue}>{selectedTx.date}</Text>
                  </View>
                  <View style={styles.detailDivider} />
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Hora</Text>
                    <Text style={styles.detailValue}>{selectedTx.time}</Text>
                  </View>
                  <View style={styles.detailDivider} />
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Descrição</Text>
                    <Text style={styles.detailValueDesc}>{selectedTx.description}</Text>
                  </View>
                </View>

                {/* Botão de Excluir */}
                <TouchableOpacity 
                  style={styles.deleteBtn}
                  onPress={handleDeleteTransaction}
                >
                  <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                  <Text style={styles.deleteBtnText}>Excluir Transação</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7' },
  
  // Header Roxo
  header: {
    backgroundColor: '#6200ee',
    height: 130, 
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

  content: { flex: 1, paddingHorizontal: 20, marginTop: 20 }, 

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

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  
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
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  categoryIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionTitle: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  transactionCategory: { color: '#999', fontSize: 12, marginTop: 2 },
  transactionAmount: { fontWeight: 'bold', fontSize: 15 },

  // --- ESTILOS DO MODAL ---
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    minHeight: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -5 },
    shadowRadius: 10,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#D1D1D1',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTxInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    flex: 1,
  },
  modalIconBg: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTxTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flexShrink: 1,
  },
  closeButton: { padding: 5 },
  
  modalAmountContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  modalBigAmount: {
    fontSize: 38,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalStatusText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailsBox: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 15,
    color: '#888',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  detailValueDesc: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 20,
  },

  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 15,
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  deleteBtnText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});