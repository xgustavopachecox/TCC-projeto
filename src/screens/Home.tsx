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

// Importação do Contexto Central
import { useTransactions, Transaction } from '../context/TransactionContext';

export default function Home() {
  const navigation = useNavigation<any>();
  
  // ==========================================
  // ESTADOS DE DATA E SELEÇÃO DE PERÍODO
  // ==========================================
  const [viewDate, setViewDate] = useState(new Date()); 
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const months = [
    'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 
    'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'
  ];
  
  const years = [2024, 2025, 2026, 2027];

  // Busca as transações REAIS do Cofre Central
  const { transactions } = useTransactions();

  // Estados para os Modais
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [analysisModalVisible, setAnalysisModalVisible] = useState(false);

  // Cores de Design
  const PRIMARY_COLOR = '#6200ee';
  const GREEN_COLOR = '#27ae60';
  const RED_COLOR = '#e74c3c';

  // ==========================================
  // MOTOR DE CÁLCULO (FILTRADO POR PERÍODO)
  // ==========================================
  
  const parseAmount = (amountStr: string) => {
    if (!amountStr) return 0;
    return parseFloat(amountStr.replace(/\./g, '').replace(',', '.'));
  };

  const formatAmount = (val: number) => {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // FILTRO: Apenas transações do período selecionado
  const filteredTransactions = transactions.filter(tx => {
    const [d, m, y] = tx.date.split('/');
    return parseInt(m) === viewDate.getMonth() + 1 && parseInt(y) === viewDate.getFullYear();
  });

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryTotals: Record<string, number> = {};

  filteredTransactions.forEach(tx => {
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

  // Estatísticas de categorias dinâmicas
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
  // FUNÇÕES DE INTERAÇÃO
  // ==========================================
  
  const changeMonth = (monthIndex: number) => {
    const newDate = new Date(viewDate.getFullYear(), monthIndex, 1);
    setViewDate(newDate);
  };

  const changeYear = (year: number) => {
    const newDate = new Date(year, viewDate.getMonth(), 1);
    setViewDate(newDate);
  };

  const openDetails = (tx: Transaction) => {
    setSelectedTx(tx);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      
      {/* HEADER DINÂMICO */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Olá, Pacheco</Text>
            <Text style={styles.subGreeting}>Resumo de {months[viewDate.getMonth()]} / {viewDate.getFullYear()}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Image source={{ uri: 'https://github.com/shadcn.png' }} style={styles.avatar} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* CARD DE SALDO COM SELETOR DE PERÍODO */}
        <View style={styles.balanceCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.balanceLabel}>Saldo do Mês</Text>
            <TouchableOpacity 
              style={styles.filterPill} 
              onPress={() => setDatePickerVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.filterText}>
                {months[viewDate.getMonth()]}/{viewDate.getFullYear()}
              </Text>
              <Ionicons name="chevron-down" size={14} color="#6200ee" />
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

        {/* ANÁLISE MENSAL FILTRADA */}
        <Text style={styles.sectionTitle}>Análise do Período</Text>
        <TouchableOpacity 
          style={styles.chartCard} 
          activeOpacity={0.8} 
          onPress={() => setAnalysisModalVisible(true)}
        >
          <View style={[styles.chartCircle, { borderColor: filteredTransactions.length > 0 ? PRIMARY_COLOR : '#EEE' }]}>
            <Text style={styles.chartPercent}>{percentSpentOfIncome}%</Text>
            <Text style={styles.chartLabel}>Gasto</Text>
          </View>
          
          <View style={styles.chartLegend}>
             {dynamicCategoryStats.slice(0, 3).map(stat => (
               <View key={stat.id} style={styles.legendItem}>
                 <View style={[styles.dot, {backgroundColor: stat.color}]} />
                 <Text style={styles.legendText}>{stat.name}</Text>
               </View>
             ))}
             {dynamicCategoryStats.length === 0 && (
               <Text style={styles.legendText}>Sem despesas registadas.</Text>
             )}
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        {/* LISTA DE LANÇAMENTOS DO MÊS SELECIONADO */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionTitle}>Lançamentos de {months[viewDate.getMonth()]}</Text>
        </View>

        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#DDD" />
            <Text style={styles.emptyText}>Nenhuma movimentação neste período.</Text>
          </View>
        ) : (
          filteredTransactions.map((item) => (
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

      {/* =================================================== */}
      {/* MODAL: SELETOR DE MÊS E ANO (CORRIGIDO)              */}
      {/* =================================================== */}
      <Modal 
        visible={datePickerVisible} 
        animationType="fade" 
        transparent={true}
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setDatePickerVisible(false)} />
          <View style={styles.pickerContent}>
            <Text style={styles.pickerTitle}>Escolher Período</Text>
            
            <Text style={styles.pickerSubLabel}>Ano</Text>
            <View style={styles.yearRow}>
              {years.map(y => (
                <TouchableOpacity 
                  key={y} 
                  style={[styles.yearBtn, viewDate.getFullYear() === y && styles.activeBtn]}
                  onPress={() => changeYear(y)}
                >
                  <Text style={[styles.yearBtnText, viewDate.getFullYear() === y && styles.activeBtnText]}>{y}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.pickerSubLabel}>Mês</Text>
            <View style={styles.monthGrid}>
              {months.map((m, index) => (
                <TouchableOpacity 
                  key={m} 
                  style={[styles.monthBtn, viewDate.getMonth() === index && styles.activeBtn]}
                  onPress={() => changeMonth(index)}
                >
                  <Text style={[styles.monthBtnText, viewDate.getMonth() === index && styles.activeBtnText]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={() => setDatePickerVisible(false)}>
              <Text style={styles.confirmBtnText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* =================================================== */}
      {/* MODAL: ANÁLISE MENSAL (MELHORADO)                   */}
      {/* =================================================== */}
      <Modal 
        visible={analysisModalVisible} 
        animationType="slide" 
        transparent={true} 
        onRequestClose={() => setAnalysisModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setAnalysisModalVisible(false)} />
          <View style={styles.analysisModalContent}>
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeaderInfo}>
              <Text style={styles.analysisModalTitle}>Análise de {months[viewDate.getMonth()]} {viewDate.getFullYear()}</Text>
              <Text style={styles.analysisModalSub}>Veja o detalhamento da sua saúde financeira</Text>
            </View>

            {/* Resumo Rápido no Modal */}
            <View style={styles.analysisSummaryCards}>
              <View style={[styles.miniCard, { borderLeftColor: GREEN_COLOR }]}>
                <Text style={styles.miniCardLabel}>Ganhos</Text>
                <Text style={[styles.miniCardValue, { color: GREEN_COLOR }]}>R$ {formatAmount(totalIncome)}</Text>
              </View>
              <View style={[styles.miniCard, { borderLeftColor: RED_COLOR }]}>
                <Text style={styles.miniCardLabel}>Gastos</Text>
                <Text style={[styles.miniCardValue, { color: RED_COLOR }]}>R$ {formatAmount(totalExpense)}</Text>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
              <Text style={styles.detailSectionTitle}>Gastos por Categoria</Text>
              
              {dynamicCategoryStats.length > 0 ? (
                dynamicCategoryStats.map((stat) => (
                  <View key={stat.id} style={styles.statCard}>
                    <View style={styles.statHeader}>
                      <View style={styles.statTitleGroup}>
                        <View style={[styles.statIconBg, { backgroundColor: stat.color + '15' }]}>
                          <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                        </View>
                        <Text style={styles.statName}>{stat.name}</Text>
                      </View>
                      <Text style={styles.statAmount}>R$ {stat.amount}</Text>
                    </View>
                    
                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${stat.percentage}%`, backgroundColor: stat.color }]} />
                      </View>
                      <Text style={styles.statPercText}>{stat.percentage}%</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.noDataContainer}>
                   <Ionicons name="stats-chart-outline" size={40} color="#CCC" />
                   <Text style={styles.noDataText}>Não há dados de gastos para exibir.</Text>
                </View>
              )}

              {totalIncome > 0 && (
                <View style={[styles.insightBox, { backgroundColor: percentSpentOfIncome > 80 ? '#FFF1F0' : '#F6FFED' }]}>
                  <Ionicons 
                    name={percentSpentOfIncome > 80 ? "warning-outline" : "checkmark-circle-outline"} 
                    size={22} 
                    color={percentSpentOfIncome > 80 ? RED_COLOR : GREEN_COLOR} 
                  />
                  <Text style={[styles.insightText, { color: percentSpentOfIncome > 80 ? RED_COLOR : GREEN_COLOR }]}>
                    Você utilizou {percentSpentOfIncome}% da sua receita mensal. 
                    {percentSpentOfIncome > 80 ? " Cuidado com o orçamento!" : " Bom trabalho!"}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7' },
  header: { 
    backgroundColor: '#6200ee', 
    height: 140, 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30, 
    paddingTop: 60, 
    paddingHorizontal: 20 
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  subGreeting: { color: '#E0E0E0', fontSize: 14, marginTop: 2 },
  profileButton: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 25 },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  
  content: { flex: 1, paddingHorizontal: 20, marginTop: 20 },
  
  balanceCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 22, 
    padding: 20, 
    elevation: 6, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 25 
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  balanceLabel: { color: '#888', fontSize: 14, fontWeight: '500' },
  filterPill: { 
    flexDirection: 'row', 
    backgroundColor: '#F3E5F5', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20, 
    alignItems: 'center', 
    gap: 6 
  },
  filterText: { color: '#6200ee', fontSize: 13, fontWeight: 'bold' },
  balanceValue: { fontSize: 34, fontWeight: 'bold', color: '#333' },
  separator: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 18 },
  rowSummary: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: '#888' },
  summaryValueUp: { fontSize: 16, fontWeight: 'bold', color: '#27ae60' },
  summaryValueDown: { fontSize: 16, fontWeight: 'bold', color: '#e74c3c' },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  
  chartCard: { 
    backgroundColor: '#FFF', 
    padding: 20, 
    borderRadius: 20, 
    marginBottom: 25, 
    flexDirection: 'row', 
    alignItems: 'center', 
    elevation: 3
  },
  chartCircle: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    borderWidth: 8, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  chartPercent: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  chartLabel: { fontSize: 10, color: '#888' },
  chartLegend: { flex: 1, marginLeft: 20, gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 14, color: '#666' },
  
  listHeaderRow: { marginBottom: 15 },
  transactionItem: { 
    backgroundColor: '#FFF', 
    padding: 16, 
    borderRadius: 18, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12,
    elevation: 2
  },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  categoryIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  transactionTitle: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  transactionCategory: { color: '#999', fontSize: 12, marginTop: 2 },
  transactionAmount: { fontWeight: 'bold', fontSize: 15 },
  
  emptyState: { alignItems: 'center', paddingVertical: 40, opacity: 0.6 },
  emptyText: { color: '#888', marginTop: 12, fontStyle: 'italic', fontSize: 15 },

  // --- ESTILOS DOS MODAIS ---
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  
  pickerContent: { 
    width: '88%', 
    backgroundColor: '#FFF', 
    borderRadius: 28, 
    padding: 25, 
    elevation: 20
  },
  pickerTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  pickerSubLabel: { fontSize: 13, color: '#999', marginBottom: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  yearRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  yearBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#F5F5F5', minWidth: 65, alignItems: 'center' },
  yearBtnText: { color: '#666', fontSize: 14 }, // CORREÇÃO: ADICIONADO
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 30 },
  monthBtn: { width: '22%', paddingVertical: 12, alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12 },
  monthBtnText: { color: '#666', fontSize: 13 }, // CORREÇÃO: ADICIONADO
  activeBtn: { backgroundColor: '#6200ee' },
  activeBtnText: { color: '#FFF', fontWeight: 'bold' },
  confirmBtn: { backgroundColor: '#6200ee', padding: 16, borderRadius: 18, alignItems: 'center' },
  confirmBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  
  // Analysis Modal Styles
  analysisModalContent: { 
    backgroundColor: '#FFF', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 25, 
    maxHeight: '90%', 
    width: '100%', 
    position: 'absolute', 
    bottom: 0 
  },
  modalHandle: { width: 45, height: 5, backgroundColor: '#E0E0E0', alignSelf: 'center', borderRadius: 3, marginBottom: 15 },
  modalHeaderInfo: { alignItems: 'center', marginBottom: 20 },
  analysisModalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  analysisModalSub: { fontSize: 13, color: '#999', marginTop: 4 },
  
  analysisSummaryCards: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  miniCard: { flex: 1, backgroundColor: '#FAFAFA', padding: 15, borderRadius: 16, borderLeftWidth: 4 },
  miniCardLabel: { fontSize: 11, color: '#888', textTransform: 'uppercase', fontWeight: 'bold' },
  miniCardValue: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  
  detailSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  statCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statIconBg: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statName: { fontWeight: 'bold', fontSize: 14, color: '#444' },
  statAmount: { fontWeight: 'bold', color: '#333', fontSize: 14 },
  
  progressBarContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBarBg: { flex: 1, height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  statPercText: { fontSize: 12, fontWeight: 'bold', color: '#888', width: 35 },
  
  insightBox: { flexDirection: 'row', padding: 15, borderRadius: 16, marginTop: 10, marginBottom: 20, alignItems: 'center', gap: 10 },
  insightText: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 18 },
  
  noDataContainer: { alignItems: 'center', paddingVertical: 40, opacity: 0.5 },
  noDataText: { textAlign: 'center', color: '#999', marginTop: 10, fontSize: 15 }
}); 