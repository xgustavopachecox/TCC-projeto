import React, { useState, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Modal,
  Platform,
  Dimensions,
  StatusBar,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, G } from 'react-native-svg';

// Importação dos Contextos
import { useTransactions, Transaction } from '../context/TransactionContext';
import { useUser } from '../context/UserContext';

export default function Home() {
  const navigation = useNavigation<any>();
  const { userName, userPhoto, investorProfile, setInvestorProfile, deleteAccount } = useUser();
  
  // ==========================================
  // ESTADOS DE DATA E MODAIS
  // ==========================================
  const [viewDate, setViewDate] = useState(new Date()); 
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [analysisModalVisible, setAnalysisModalVisible] = useState(false);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  // Estados temporários para edição do perfil
  const { setUserName, setUserPhoto } = useUser();
  const [tempName, setTempName] = useState(userName);
  const [tempPhotoUrl, setTempPhotoUrl] = useState(userPhoto);

  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const years = [2024, 2025, 2026, 2027];

  const { transactions } = useTransactions();

  const PRIMARY_COLOR = '#6200ee';
  const GREEN_COLOR = '#27ae60';
  const RED_COLOR = '#e74c3c';

  // ==========================================
  // MOTOR DE CÁLCULO
  // ==========================================
  const parseAmount = (amountStr: string) => {
    if (!amountStr) return 0;
    return parseFloat(amountStr.replace(/\./g, '').replace(',', '.'));
  };

  const formatAmount = (val: number) => {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // 1. SALDO ACUMULADO (A CORREÇÃO SOLICITADA)
  // O orçamento permanece acumulado considerando tudo até ao fim do mês que estás a ver
  const accumulatedTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const [d, m, y] = tx.date.split('/');
      const txDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      const lastDayOfViewMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
      return txDate <= lastDayOfViewMonth;
    });
  }, [transactions, viewDate]);

  const currentBalance = useMemo(() => {
    let balance = 0;
    accumulatedTransactions.forEach(tx => {
      const val = parseAmount(tx.amount);
      if (tx.type === 'up') balance += val;
      else balance -= val;
    });
    return balance;
  }, [accumulatedTransactions]);

  // 2. RESUMO DO MÊS (Apenas fluxo do período)
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const [d, m, y] = tx.date.split('/');
      return parseInt(m) === viewDate.getMonth() + 1 && parseInt(y) === viewDate.getFullYear();
    });
  }, [transactions, viewDate]);

  const { totalIncome, totalExpense, categoryTotals } = useMemo(() => {
    let income = 0;
    let expense = 0;
    const totals: Record<string, number> = {};

    filteredTransactions.forEach(tx => {
      const val = parseAmount(tx.amount);
      if (tx.type === 'up') {
        income += val;
      } else {
        expense += val;
        if (!totals[tx.category]) totals[tx.category] = 0;
        totals[tx.category] += val;
      }
    });

    return { totalIncome: income, totalExpense: expense, categoryTotals: totals };
  }, [filteredTransactions]);

  const percentSpentOfIncome = useMemo(() => {
    return totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;
  }, [totalIncome, totalExpense]);

  const dynamicCategoryStats = useMemo(() => {
    return Object.keys(categoryTotals).map((catName, index) => {
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
  }, [categoryTotals, totalExpense]);

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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
      
      {/* HEADER COM PERFIL */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeftGroup}>
            <TouchableOpacity 
              onPress={() => setProfileModalVisible(true)}
              style={styles.profileButton}
            >
              <Image source={{ uri: userPhoto }} style={styles.avatar} />
            </TouchableOpacity>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.greeting}>Olá, {userName}</Text>
              <Text style={styles.subGreeting}>{months[viewDate.getMonth()]} / {viewDate.getFullYear()}</Text>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
              <Ionicons name={showBalance ? "eye-outline" : "eye-off-outline"} size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* CARD DE CONTA */}
        <View style={styles.balanceCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.balanceLabel}>Saldo disponível</Text>
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
          
          <Text style={styles.balanceValue}>
            {showBalance ? `R$ ${formatAmount(currentBalance)}` : '••••'}
          </Text>

          <View style={styles.separator} />

          <View style={styles.rowSummary}>
             <View style={styles.summaryItem}>
                <View style={[styles.iconBg, { backgroundColor: '#e8f5e9' }]}>
                  <Ionicons name="arrow-up" size={18} color="#27ae60" />
                </View>
                <View>
                  <Text style={styles.summaryLabel}>Entradas</Text>
                  <Text style={styles.summaryValueUp}>{showBalance ? `R$ ${formatAmount(totalIncome)}` : '••••'}</Text>
                </View>
             </View>

             <View style={styles.summaryItem}>
                <View style={[styles.iconBg, { backgroundColor: '#ffebee' }]}>
                  <Ionicons name="arrow-down" size={18} color="#e74c3c" />
                </View>
                <View>
                  <Text style={styles.summaryLabel}>Saídas</Text>
                  <Text style={styles.summaryValueDown}>{showBalance ? `R$ ${formatAmount(totalExpense)}` : '••••'}</Text>
                </View>
             </View>
          </View>
        </View>

        {/* ANÁLISE MENSAL */}
        <Text style={styles.sectionTitle}>Análise do Período</Text>
        <TouchableOpacity 
          style={styles.chartCard} 
          activeOpacity={0.8} 
          onPress={() => setAnalysisModalVisible(true)}
        >
          <View style={styles.chartCircleContainer}>
            <Svg width="80" height="80" viewBox="0 0 80 80" style={{ position: 'absolute' }}>
              <G rotation="-90" origin="40, 40">
                {dynamicCategoryStats.length === 0 ? (
                  <Circle cx="40" cy="40" r="36" fill="transparent" stroke="#EEE" strokeWidth="8" />
                ) : (() => {
                  let currentOffset = 0;
                  const radius = 36;
                  const circumference = 2 * Math.PI * radius;
                  
                  return dynamicCategoryStats.map((stat) => {
                    const exactPercentage = (stat.rawAmount / totalExpense) * 100;
                    const strokeDashoffset = circumference - (circumference * exactPercentage) / 100;
                    const angle = (currentOffset / 100) * 360;
                    currentOffset += exactPercentage;

                    return (
                      <Circle
                        key={stat.id}
                        cx="40"
                        cy="40"
                        r={radius}
                        fill="transparent"
                        stroke={stat.color}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        rotation={angle}
                        origin="40, 40"
                      />
                    );
                  });
                })()}
              </G>
            </Svg>
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
               <Text style={styles.legendText}>Sem despesas no mês.</Text>
             )}
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        {/* LANÇAMENTOS DO MÊS */}
        <Text style={styles.sectionTitle}>Lançamentos de {months[viewDate.getMonth()]}</Text>
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#DDD" />
            <Text style={styles.emptyText}>Nenhuma movimentação neste período.</Text>
          </View>
        ) : (
          filteredTransactions.map((item) => (
            <View key={item.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View style={[styles.categoryIcon, { backgroundColor: item.type === 'up' ? '#e8f5e9' : '#ffebee' }]}>
                  <Ionicons name={item.type === 'up' ? "arrow-up" : "arrow-down"} size={20} color={item.type === 'up' ? GREEN_COLOR : RED_COLOR} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.transactionTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
                  <Text style={styles.transactionCategory}>{item.category} • {item.date}</Text>
                </View>
              </View>
              <Text style={[styles.transactionAmount, { color: item.type === 'up' ? GREEN_COLOR : RED_COLOR }]}>
                {showBalance ? (item.type === 'up' ? '+ R$ ' : '- R$ ') + item.amount : '••••'}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* MODAL CONFIGURAÇÕES (NUBANK STYLE) */}
      <Modal visible={profileModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlayDark}>
          <View style={styles.nubankModal}>
            <View style={[styles.modalTopNav, { justifyContent: 'flex-end' }]}>
              <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                <Ionicons name="close" size={28} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.userProfileSection}>
                <View style={styles.avatarLargeContainer}>
                  <Image source={{ uri: userPhoto }} style={styles.avatarLarge} />
                  <View style={styles.cameraBadge}><Ionicons name="camera" size={14} color="#FFF" /></View>
                </View>
                <Text style={styles.userNameHeader}>{userName}</Text>
              </View>

              {/* Botão de Perfil Investidor (Score Style) */}
              <TouchableOpacity 
                style={styles.scoreCard}
                onPress={() => {
                  setProfileModalVisible(false);
                  // Reseta o perfil mockado para forçar o quiz aparecer novamente
                  if (investorProfile !== 'Não definido') setInvestorProfile('Não definido');
                  navigation.navigate('I.A');
                }}
              >
                <View style={styles.scoreLeft}>
                   <Ionicons name="speedometer-outline" size={24} color="#FFF" />
                   <View style={{ marginLeft: 15 }}>
                      <Text style={styles.scoreLabel}>Perfil de Investidor</Text>
                      <Text style={styles.scoreSub}>{investorProfile}</Text>
                   </View>
                </View>
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreBadgeText}>
                    {investorProfile === 'Não definido' ? 'Fazer' : 'Refazer'}
                  </Text>
                </View>
              </TouchableOpacity>

              <Text style={styles.menuLabel}>A minha conta</Text>
              
              <TouchableOpacity style={styles.menuRow} onPress={() => { setTempName(userName); setTempPhotoUrl(userPhoto); setEditProfileModalVisible(true); }}>
                <View style={styles.menuRowLeft}>
                  <Ionicons name="person-outline" size={22} color="#FFF" />
                  <Text style={styles.menuRowText}>Editar Perfil</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#333" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuRow}>
                <View style={styles.menuRowLeft}>
                  <Ionicons name="grid-outline" size={22} color="#FFF" />
                  <Text style={styles.menuRowText}>Configurar Categorias</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#333" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.logoutBtn}>
                <Ionicons name="log-out-outline" size={22} color="#FFF" />
                <Text style={styles.logoutText}>Sair da aplicação</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.logoutBtn, { marginTop: 20, paddingBottom: 40 }]}
                onPress={() => {
                  Alert.alert(
                    "Excluir Conta",
                    "Tem certeza que deseja excluir sua conta? Todos os seus dados, transações, perfil e categorias serão apagados permanentemente.",
                    [
                      { text: "Cancelar", style: "cancel" },
                      { 
                        text: "Excluir", 
                        style: "destructive", 
                        onPress: () => {
                          setProfileModalVisible(false);
                          deleteAccount();
                        }
                      }
                    ]
                  );
                }}
              >
                <Ionicons name="trash-outline" size={22} color="#e74c3c" />
                <Text style={[styles.logoutText, { color: '#e74c3c' }]}>Excluir conta</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL SELETOR DE DATA */}
      <Modal visible={datePickerVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setDatePickerVisible(false)} />
          <View style={styles.pickerContent}>
            <Text style={styles.pickerTitle}>Escolher Período</Text>
            
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

      {/* MODAL ANÁLISE MENSAL */}
      <Modal visible={analysisModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setAnalysisModalVisible(false)} />
          <View style={styles.analysisModalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.analysisModalTitle}>Análise de {months[viewDate.getMonth()]}</Text>
            
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

            <ScrollView showsVerticalScrollIndicator={false}>
              {dynamicCategoryStats.map((stat) => (
                <View key={stat.id} style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Text style={styles.statName}>{stat.name}</Text>
                    <Text style={styles.statAmount}>R$ {stat.amount}</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${stat.percentage}%`, backgroundColor: stat.color }]} />
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL EDITAR PERFIL */}
      <Modal visible={editProfileModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlayDarkTranslucent}>
          <View style={styles.editProfileCard}>
            <Text style={styles.editProfileTitle}>Editar Perfil</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Como devemos lhe chamar?</Text>
              <TextInput 
                style={styles.textInput} 
                value={tempName} 
                onChangeText={setTempName} 
                placeholder="Ex: Pacheco"
                placeholderTextColor="#A0A0A0"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>URL da sua Foto (opcional)</Text>
              <TextInput 
                style={styles.textInput} 
                value={tempPhotoUrl} 
                onChangeText={setTempPhotoUrl} 
                placeholder="Ex: https://github.com/..."
                placeholderTextColor="#A0A0A0"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.editProfileActions}>
              <TouchableOpacity 
                style={[styles.editProfileBtn, { backgroundColor: '#F0F0F0' }]} 
                onPress={() => setEditProfileModalVisible(false)}
              >
                <Text style={[styles.editProfileBtnText, { color: '#666' }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.editProfileBtn, { backgroundColor: '#6200ee' }]} 
                onPress={() => {
                  if (tempName) setUserName(tempName);
                  if (tempPhotoUrl) setUserPhoto(tempPhotoUrl);
                  setEditProfileModalVisible(false);
                }}
              >
                <Text style={[styles.editProfileBtnText, { color: '#FFF' }]}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7' },
  header: { backgroundColor: '#6200ee', height: 140, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, paddingTop: 60, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeftGroup: { flexDirection: 'row', alignItems: 'center' },
  greeting: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  subGreeting: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
  profileButton: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 25 },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  content: { flex: 1, paddingHorizontal: 20, marginTop: 20 },
  balanceCard: { backgroundColor: '#FFF', borderRadius: 22, padding: 20, elevation: 6, marginBottom: 25 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  balanceLabel: { color: '#888', fontSize: 14 },
  filterPill: { flexDirection: 'row', backgroundColor: '#F3E5F5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignItems: 'center', gap: 6 },
  filterText: { color: '#6200ee', fontSize: 13, fontWeight: 'bold' },
  balanceValue: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  separator: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 18 },
  rowSummary: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: '#888' },
  summaryValueUp: { fontSize: 15, fontWeight: 'bold', color: '#27ae60' },
  summaryValueDown: { fontSize: 15, fontWeight: 'bold', color: '#e74c3c' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  chartCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 25, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  chartCircleContainer: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center' },
  chartPercent: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  chartLabel: { fontSize: 10, color: '#888' },
  chartLegend: { flex: 1, marginLeft: 20, gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 14, color: '#666' },
  transactionItem: { backgroundColor: '#FFF', padding: 16, borderRadius: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, elevation: 2 },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1, marginRight: 10 },
  categoryIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  transactionTitle: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  transactionCategory: { color: '#999', fontSize: 12 },
  transactionAmount: { fontWeight: 'bold', fontSize: 15 },
  emptyState: { alignItems: 'center', paddingVertical: 40, opacity: 0.6 },
  emptyText: { color: '#888', marginTop: 12, fontStyle: 'italic' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  pickerContent: { width: '88%', backgroundColor: '#FFF', borderRadius: 28, padding: 25, elevation: 20 },
  pickerTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  yearRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  yearBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#F5F5F5' },
  yearBtnText: { color: '#666', fontSize: 14, fontWeight: '500' },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 30 },
  monthBtn: { width: '22%', paddingVertical: 12, alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12 },
  monthBtnText: { color: '#666', fontSize: 13, fontWeight: '500' },
  activeBtn: { backgroundColor: '#6200ee' },
  activeBtnText: { color: '#FFF', fontWeight: 'bold' },
  confirmBtn: { backgroundColor: '#6200ee', padding: 16, borderRadius: 18, alignItems: 'center' },
  confirmBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  modalOverlayDark: { flex: 1, backgroundColor: '#000' },
  nubankModal: { flex: 1, padding: 20, paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  modalTopNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  userProfileSection: { marginBottom: 40 },
  avatarLargeContainer: { width: 80, height: 80, borderRadius: 40, marginBottom: 15, position: 'relative' },
  avatarLarge: { width: 80, height: 80, borderRadius: 40 },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#6200ee', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#000' },
  userNameHeader: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  userAccountText: { color: '#888', fontSize: 14, marginTop: 4 },
  scoreCard: { backgroundColor: '#111', padding: 20, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 },
  scoreLeft: { flexDirection: 'row', alignItems: 'center' },
  scoreLabel: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  scoreSub: { color: '#888', fontSize: 13, marginTop: 2 },
  scoreBadge: { backgroundColor: '#6200ee', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  scoreBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  menuLabel: { color: '#888', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#111' },
  menuRowLeft: { flexDirection: 'row', alignItems: 'center' },
  menuRowText: { color: '#FFF', fontSize: 16, marginLeft: 15 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 40 },
  logoutText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  analysisModalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '90%', width: '100%', position: 'absolute', bottom: 0 },
  modalHandle: { width: 45, height: 5, backgroundColor: '#E0E0E0', alignSelf: 'center', borderRadius: 3, marginBottom: 15 },
  analysisModalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#333' },
  analysisSummaryCards: { flexDirection: 'row', gap: 12, marginVertical: 20 },
  miniCard: { flex: 1, backgroundColor: '#FAFAFA', padding: 15, borderRadius: 16, borderLeftWidth: 4 },
  miniCardLabel: { fontSize: 11, color: '#888', textTransform: 'uppercase' },
  miniCardValue: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  statCard: { marginBottom: 15 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statName: { fontWeight: 'bold', fontSize: 14 },
  statAmount: { color: '#333' },
  progressBarBg: { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%' },
  modalOverlayDarkTranslucent: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  editProfileCard: { width: '88%', backgroundColor: '#FFF', borderRadius: 24, padding: 25, elevation: 10 },
  editProfileTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  inputGroup: { marginBottom: 15 },
  inputLabel: { fontSize: 13, fontWeight: 'bold', color: '#666', marginBottom: 6 },
  textInput: { backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, fontSize: 15, color: '#333', borderWidth: 1, borderColor: '#E0E0E0' },
  editProfileActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 10 },
  editProfileBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  editProfileBtnText: { fontWeight: 'bold', fontSize: 15 }
});