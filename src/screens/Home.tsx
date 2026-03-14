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
import { useTransactions, Transaction } from '../context/TransactionContext'; // IMPORTA O COFRE CENTRAL

export default function Home() {
  const navigation = useNavigation<any>();
  const [currentMonth, setCurrentMonth] = useState('MAR/2026'); // Atualizado para o mês atual

  // 1. Vai buscar as transações REAIS ao Contexto
  const { transactions } = useTransactions();

  // 2. Pega apenas as 5 mais recentes para mostrar na Home
  const recentTransactions = transactions.slice(0, 5);

  // Estados dos Modais
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [analysisModalVisible, setAnalysisModalVisible] = useState(false);

  const PRIMARY_COLOR = '#6200ee';
  const GREEN_COLOR = '#27ae60';
  const RED_COLOR = '#e74c3c';

  // ==========================================
  // MOTOR DE CÁLCULO INTELIGENTE (Tempo Real)
  // ==========================================
  const parseAmount = (amountStr: string) => {
    if (!amountStr) return 0;
    return parseFloat(amountStr.replace(/\./g, '').replace(',', '.'));
  };

  const formatAmount = (val: number) => {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryTotals: Record<string, number> = {};

  // Analisa TODAS as transações do cofre
  transactions.forEach(tx => {
    const val = parseAmount(tx.amount);
    
    if (tx.type === 'up') {
      totalIncome += val;
    } else {
      totalExpense += val;
      if (!categoryTotals[tx.category]) categoryTotals[tx.category] = 0;
      categoryTotals[tx.category] += val;
    }
  });

  const currentBalance = totalIncome - totalExpense;
  const percentSpentOfIncome = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;

  const dynamicCategoryStats = Object.keys(categoryTotals).map((catName, index) => {
    const val = categoryTotals[catName];
    const percentageOfExpenses = totalExpense > 0 ? Math.round((val / totalExpense) * 100) : 0;

    const colors = ['#6200ee', '#ffb74d', '#26c6da', '#e74c3c', '#2ecc71', '#f1c40f'];
    const icons = ['cart-outline', 'game-controller-outline', 'car-outline', 'home-outline', 'medkit-outline', 'wallet-outline'];

    return {
      id: `cat_${index}`,
      name: catName,
      icon: icons[index % icons.length],
      color: colors[index % colors.length],
      percentage: percentageOfExpenses,
      amount: formatAmount(val),
      rawAmount: val
    };
  }).sort((a, b) => b.rawAmount - a.rawAmount);

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Olá, Pacheco</Text>
            <Text style={styles.subGreeting}>Rumo à liberdade financeira!</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Image source={{ uri: 'https://github.com/shadcn.png' }} style={styles.avatar} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        <View style={styles.balanceCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.balanceLabel}>Saldo Total</Text>
            <TouchableOpacity style={styles.filterPill}>
              <Text style={styles.filterText}>{currentMonth}</Text>
              <Ionicons name="chevron-down" size={12} color="#6200ee" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.balanceValue}>R$ {formatAmount(currentBalance)}</Text>

          <View style={styles.separator} />

          <View style={styles.rowSummary}>
             <View style={styles.summaryItem}>
                <View style={[styles.iconBg, { backgroundColor: '#e8f5e9' }]}>
                  <Ionicons name="arrow-up" size={18} color="#27ae60" />
                </View>
                <View>
                  <Text style={styles.summaryLabel}>Entradas</Text>
                  <Text style={styles.summaryValueUp}>R$ {formatAmount(totalIncome)}</Text>
                </View>
             </View>

             <View style={styles.summaryItem}>
                <View style={[styles.iconBg, { backgroundColor: '#ffebee' }]}>
                  <Ionicons name="arrow-down" size={18} color="#e74c3c" />
                </View>
                <View>
                  <Text style={styles.summaryLabel}>Saídas</Text>
                  <Text style={styles.summaryValueDown}>R$ {formatAmount(totalExpense)}</Text>
                </View>
             </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Análise Mensal</Text>
        <TouchableOpacity style={styles.chartCard} activeOpacity={0.8} onPress={() => setAnalysisModalVisible(true)}>
          <View style={styles.chartCircle}>
            <Text style={styles.chartPercent}>{percentSpentOfIncome}%</Text>
            <Text style={styles.chartLabel}>Gastos</Text>
          </View>
          
          <View style={styles.chartLegend}>
             {dynamicCategoryStats.slice(0, 3).map(stat => (
               <View key={stat.id} style={styles.legendItem}>
                 <View style={[styles.dot, {backgroundColor: stat.color}]} />
                 <Text style={styles.legendText}>{stat.name}</Text>
               </View>
             ))}
             {dynamicCategoryStats.length === 0 && (
               <Text style={styles.legendText}>Sem gastos este mês.</Text>
             )}
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.chartArrow} />
        </TouchableOpacity>

        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recentes</Text>
          {transactions.length > 5 && (
            <TouchableOpacity onPress={() => navigation.navigate('Extrato')}>
              <Text style={styles.seeAll}>Ver tudo</Text>
            </TouchableOpacity>
          )}
        </View>

        {recentTransactions.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#999', marginTop: 10, fontStyle: 'italic' }}>
            Nenhuma transação registada ainda.
          </Text>
        ) : (
          recentTransactions.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.transactionItem}
              activeOpacity={0.7}
              onPress={() => openDetails(item)}
            >
              <View style={styles.transactionLeft}>
                <View style={[styles.categoryIcon, { backgroundColor: item.type === 'up' ? '#e8f5e9' : '#ffebee' }]}>
                  <Ionicons name={item.type === 'up' ? "arrow-up" : "arrow-down"} size={20} color={item.type === 'up' ? GREEN_COLOR : RED_COLOR} />
                </View>
                <View>
                  <Text style={styles.transactionTitle}>{item.title}</Text>
                  <Text style={styles.transactionCategory}>{item.category} • {item.date}</Text>
                </View>
              </View>
              <Text style={[styles.transactionAmount, { color: item.type === 'up' ? GREEN_COLOR : RED_COLOR }]}>
                {item.type === 'up' ? '+ R$ ' : '- R$ '}{item.amount}
              </Text>
            </TouchableOpacity>
          ))
        )}

      </ScrollView>

      {/* MODAL DE ANÁLISE */}
      <Modal visible={analysisModalVisible} animationType="slide" transparent={true} onRequestClose={() => setAnalysisModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setAnalysisModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTxTitle}>Detalhamento de Gastos</Text>
              <TouchableOpacity onPress={() => setAnalysisModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <Text style={styles.analysisSubtitle}>
              Este mês, você já gastou <Text style={{fontWeight: 'bold', color: RED_COLOR}}>{percentSpentOfIncome}%</Text> da sua receita total. Veja onde o seu dinheiro foi parar:
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
              {dynamicCategoryStats.length > 0 ? (
                dynamicCategoryStats.map((stat) => (
                  <View key={stat.id} style={styles.statCard}>
                    <View style={styles.statHeader}>
                      <View style={styles.statTitleGroup}>
                        <View style={[styles.statIconBg, { backgroundColor: stat.color + '20' }]}>
                          <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                        </View>
                        <Text style={styles.statName}>{stat.name}</Text>
                      </View>
                      <Text style={styles.statAmount}>R$ {stat.amount}</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${stat.percentage}%`, backgroundColor: stat.color }]} />
                    </View>
                    <Text style={styles.statPercentageText}>{stat.percentage}% das despesas</Text>
                  </View>
                ))
              ) : (
                <Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>Ainda não há despesas registadas.</Text>
              )}

              {dynamicCategoryStats.length > 0 && (
                <View style={styles.insightBox}>
                  <Ionicons name="bulb-outline" size={24} color="#f1c40f" />
                  <Text style={styles.insightText}>
                    <Text style={{fontWeight: 'bold'}}>Dica: </Text>
                    Sua maior despesa atual é com <Text style={{fontWeight: 'bold'}}>{dynamicCategoryStats[0].name}</Text> (representa {dynamicCategoryStats[0].percentage}% do que gastou). Fique de olho nesta categoria!
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL DE DETALHES DA TRANSAÇÃO (Apenas visualização na Home) */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={closeDetails}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeDetails} />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            {selectedTx && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTxInfo}>
                    <View style={[styles.modalIconBg, { backgroundColor: selectedTx.type === 'up' ? '#e8f5e9' : '#ffebee' }]}>
                      <Ionicons name={selectedTx.type === 'up' ? "arrow-up" : "arrow-down"} size={28} color={selectedTx.type === 'up' ? GREEN_COLOR : RED_COLOR} />
                    </View>
                    <Text style={styles.modalTxTitle}>{selectedTx.title}</Text>
                  </View>
                  <TouchableOpacity onPress={closeDetails} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#999" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalAmountContainer}>
                  <Text style={[styles.modalBigAmount, { color: selectedTx.type === 'up' ? GREEN_COLOR : RED_COLOR }]}>
                    {selectedTx.type === 'up' ? '+ R$ ' : '- R$ '}{selectedTx.amount}
                  </Text>
                  <Text style={styles.modalStatusText}><Ionicons name="checkmark-circle" size={14} color={GREEN_COLOR} /> Concluído</Text>
                </View>

                <View style={styles.detailsBox}>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Categoria</Text><Text style={styles.detailValue}>{selectedTx.category}</Text></View>
                  <View style={styles.detailDivider} />
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Data</Text><Text style={styles.detailValue}>{selectedTx.date}</Text></View>
                  <View style={styles.detailDivider} />
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Hora</Text><Text style={styles.detailValue}>{selectedTx.time}</Text></View>
                  <View style={styles.detailDivider} />
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Descrição</Text><Text style={styles.detailValueDesc}>{selectedTx.description}</Text></View>
                </View>

                {/* Removido o botão de excluir da Home, a exclusão deve ser feita no Extrato */}
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
  header: { backgroundColor: '#6200ee', height: 130, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, paddingTop: 60, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  subGreeting: { color: '#E0E0E0', fontSize: 14, marginTop: 4 },
  profileButton: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)', borderRadius: 30 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  content: { flex: 1, paddingHorizontal: 20, marginTop: 20 }, 
  balanceCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, marginBottom: 25 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  balanceLabel: { color: '#888', fontSize: 14, fontWeight: '500' },
  filterPill: { flexDirection: 'row', backgroundColor: '#ede7f6', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, alignItems: 'center', gap: 5 },
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
  chartCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2 },
  chartCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 10, borderColor: '#6200ee', justifyContent: 'center', alignItems: 'center' },
  chartPercent: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  chartLabel: { fontSize: 10, color: '#888' },
  chartLegend: { gap: 8, flex: 1, marginLeft: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 14, color: '#555' },
  chartArrow: { opacity: 0.5 },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  seeAll: { color: '#6200ee', fontWeight: 'bold' },
  transactionItem: { backgroundColor: '#FFF', padding: 15, borderRadius: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  categoryIcon: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  transactionTitle: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  transactionCategory: { color: '#999', fontSize: 12, marginTop: 2 },
  transactionAmount: { fontWeight: 'bold', fontSize: 15 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { backgroundColor: '#F8F9FA', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, minHeight: 400, maxHeight: '80%', elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: -5 }, shadowRadius: 10 },
  modalHandle: { width: 40, height: 5, backgroundColor: '#D1D1D1', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTxInfo: { flexDirection: 'row', alignItems: 'center', gap: 15, flex: 1 },
  modalIconBg: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  modalTxTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', flexShrink: 1 },
  closeButton: { padding: 5 },
  modalAmountContainer: { alignItems: 'center', marginVertical: 20 },
  modalBigAmount: { fontSize: 38, fontWeight: 'bold', marginBottom: 5 },
  modalStatusText: { fontSize: 14, color: '#666', fontWeight: '500', flexDirection: 'row', alignItems: 'center' },
  detailsBox: { backgroundColor: '#FFF', borderRadius: 16, padding: 15, marginBottom: 25, borderWidth: 1, borderColor: '#EFEFEF' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 10 },
  detailDivider: { height: 1, backgroundColor: '#F0F0F0' },
  detailLabel: { fontSize: 15, color: '#888', fontWeight: '500' },
  detailValue: { fontSize: 15, color: '#333', fontWeight: '600' },
  detailValueDesc: { fontSize: 15, color: '#333', fontWeight: '500', flex: 1, textAlign: 'right', marginLeft: 20 },
  analysisSubtitle: { fontSize: 15, color: '#555', lineHeight: 22, marginBottom: 15 },
  statCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#EFEFEF' },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statIconBg: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  statAmount: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  progressBarBg: { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressBarFill: { height: '100%', borderRadius: 4 },
  statPercentageText: { fontSize: 12, color: '#888', textAlign: 'right' },
  insightBox: { flexDirection: 'row', backgroundColor: '#fff9c4', padding: 15, borderRadius: 15, marginTop: 10, marginBottom: 20, alignItems: 'flex-start', gap: 12 },
  insightText: { flex: 1, fontSize: 14, color: '#827717', lineHeight: 20 }
});