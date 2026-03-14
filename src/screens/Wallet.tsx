import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SectionList, 
  TouchableOpacity,
  Modal,
  Platform,
  TextInput,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

// IMPORTAMOS O NOSSO COFRE CENTRAL E A TIPAGEM
import { useTransactions, Transaction } from '../context/TransactionContext';

export default function Wallet() {
  const PRIMARY_COLOR = '#6200ee';
  const GREEN_COLOR = '#27ae60';
  const RED_COLOR = '#e74c3c';

  // Vai buscar a lista real e a função de apagar ao Cofre
  const { transactions, deleteTransaction } = useTransactions();
  
  // Estados de Filtro Simples e Modal
  const [filter, setFilter] = useState<'all' | 'up' | 'down'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // ==========================================
  // ESTADOS DA PESQUISA AVANÇADA (NOVO)
  // ==========================================
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('Todas');
  const [searchDate, setSearchDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateObj, setDateObj] = useState(new Date());

  // Gera a lista de categorias disponíveis baseada nas transações existentes
  const availableCategories = ['Todas', ...Array.from(new Set(transactions.map(t => t.category)))];

  const toggleSearchPanel = () => {
    if (isSearchActive) {
      // Limpa os filtros ao fechar a barra de pesquisa
      setSearchQuery('');
      setSearchCategory('Todas');
      setSearchDate('');
    }
    setIsSearchActive(!isSearchActive);
  };

  const handleDateSearchChange = (text: string) => {
    let cleaned = text.replace(/\D/g, '');
    let masked = cleaned;
    if (cleaned.length > 2) masked = cleaned.replace(/^(\d{2})(\d)/, '$1/$2');
    if (cleaned.length > 4) masked = masked.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
    setSearchDate(masked.substring(0, 10)); 
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); 
    if (selectedDate) {
      setDateObj(selectedDate);
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      setSearchDate(`${day}/${month}/${year}`);
    }
  };

  // ==========================================
  // FILTRAGEM INTELIGENTE
  // ==========================================
  const filteredData = transactions.filter(item => {
    // 1. Filtro Tipo (Botões: Tudo, Entradas, Saídas)
    const matchType = filter === 'all' || item.type === filter;
    
    // 2. Filtro de Texto (Título ou Descrição)
    const matchName = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      item.description.toLowerCase().includes(searchQuery.toLowerCase());
                      
    // 3. Filtro de Categoria
    const matchCategory = searchCategory === 'Todas' || item.category === searchCategory;
    
    // 4. Filtro de Data
    const matchDate = searchDate === '' || item.date.includes(searchDate);

    return matchType && matchName && matchCategory && matchDate;
  });

  // ==========================================
  // AGRUPAR TRANSAÇÕES POR DATA
  // ==========================================
  const groupTransactions = () => {
    const grouped = filteredData.reduce((acc: any, tx) => {
      if (!acc[tx.date]) acc[tx.date] = [];
      acc[tx.date].push(tx);
      return acc;
    }, {});

    const sections = Object.keys(grouped).map(dateStr => {
      let titulo = dateStr;
      try {
        const [d, m, y] = dateStr.split('/');
        if (d && m && y) {
          const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
          const diaSemana = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' }).replace('-feira', '');
          const dia = dateObj.getDate();
          const mes = dateObj.toLocaleDateString('pt-BR', { month: 'long' });
          titulo = `${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}, ${dia} de ${mes}`;
        }
      } catch (e) {}

      return {
        title: titulo,
        dateStr: dateStr,
        data: grouped[dateStr]
      };
    });

    sections.sort((a, b) => {
      const [d1, m1, y1] = a.dateStr.split('/');
      const [d2, m2, y2] = b.dateStr.split('/');
      return new Date(Number(y2), Number(m2)-1, Number(d2)).getTime() - new Date(Number(y1), Number(m1)-1, Number(d1)).getTime();
    });

    return sections;
  };

  const sectionsData = groupTransactions();

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
      deleteTransaction(selectedTx.id); 
      closeDetails();
    }
  };

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================
  const renderItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity style={styles.transactionItem} activeOpacity={0.7} onPress={() => openDetails(item)}>
      <View style={styles.transactionLeft}>
        <View style={[styles.categoryIcon, { backgroundColor: item.type === 'up' ? '#e8f5e9' : '#ffebee' }]}>
          <Ionicons name={item.type === 'up' ? "arrow-up" : "arrow-down"} size={20} color={item.type === 'up' ? GREEN_COLOR : RED_COLOR} />
        </View>
        <View>
          <Text style={styles.transactionTitle}>{item.title}</Text>
          <Text style={styles.transactionCategory}>{item.category} • {item.time}</Text>
        </View>
      </View>
      <Text style={[styles.transactionAmount, { color: item.type === 'up' ? GREEN_COLOR : RED_COLOR }]}>
        {item.type === 'up' ? '+' : '-'}R$ {item.amount}
      </Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title } }: any) => (
    <View style={styles.sectionHeader}>
      <Ionicons name="calendar-outline" size={16} color="#666" style={{ marginRight: 8 }} />
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Extrato</Text>
        <TouchableOpacity onPress={toggleSearchPanel}>
          <Ionicons 
            name={isSearchActive ? "close-circle" : "search"} 
            size={26} 
            color={isSearchActive ? PRIMARY_COLOR : "#333"} 
          />
        </TouchableOpacity>
      </View>

      {/* PAINEL DE PESQUISA AVANÇADA (Mostra ao clicar na Lupa) */}
      {isSearchActive && (
        <View style={styles.searchPanel}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color="#999" />
            <TextInput 
              style={styles.searchInput}
              placeholder="Buscar por nome ou descrição..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <Text style={styles.filterSubtitle}>Filtrar por Categoria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {availableCategories.map(cat => (
              <TouchableOpacity 
                key={cat}
                style={[styles.categoryChip, searchCategory === cat && styles.categoryChipActive]}
                onPress={() => setSearchCategory(cat)}
              >
                <Text style={[styles.categoryChipText, searchCategory === cat && styles.categoryChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.filterSubtitle}>Filtrar por Data</Text>
          <View style={styles.searchInputContainer}>
            <Ionicons name="calendar-outline" size={20} color="#999" />
            <TextInput 
              style={styles.searchInput}
              placeholder="Ex: 12/03/2026"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={searchDate}
              onChangeText={handleDateSearchChange}
              maxLength={10}
            />
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ padding: 4, marginLeft: 5 }}>
              <Ionicons name="calendar" size={24} color={PRIMARY_COLOR} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* BOTÕES DE FILTRO SIMPLES (Tudo / Entradas / Saídas) */}
      <View style={styles.filterContainer}>
        <TouchableOpacity style={[styles.filterBtn, filter === 'all' && { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }]} onPress={() => setFilter('all')}>
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Tudo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterBtn, filter === 'up' && { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }]} onPress={() => setFilter('up')}>
          <Text style={[styles.filterText, filter === 'up' && styles.filterTextActive]}>Entradas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterBtn, filter === 'down' && { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }]} onPress={() => setFilter('down')}>
          <Text style={[styles.filterText, filter === 'down' && styles.filterTextActive]}>Saídas</Text>
        </TouchableOpacity>
      </View>

      <SectionList
        sections={sectionsData}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="search-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>
          </View>
        }
      />

      {/* MODAL DE DETALHES DA TRANSAÇÃO */}
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

                <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteTransaction}>
                  <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                  <Text style={styles.deleteBtnText}>Excluir Transação</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* COMPONENTE DO CALENDÁRIO OCULTO */}
      {showDatePicker && (
        <DateTimePicker 
          value={dateObj} 
          mode="date" 
          display="default" 
          onChange={onDateChange} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7', paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  
  // --- ESTILOS DA PESQUISA AVANÇADA ---
  searchPanel: { backgroundColor: '#FFF', marginHorizontal: 20, marginBottom: 15, padding: 15, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 12, height: 48, marginBottom: 15 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#333' },
  filterSubtitle: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 8, marginLeft: 2 },
  categoryScroll: { gap: 10, paddingBottom: 15 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F2F5', borderWidth: 1, borderColor: '#E0E0E0' },
  categoryChipActive: { backgroundColor: '#6200ee', borderColor: '#6200ee' },
  categoryChipText: { color: '#666', fontWeight: '500', fontSize: 14 },
  categoryChipTextActive: { color: '#FFF' },

  filterContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15, gap: 10 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#ddd' },
  filterText: { color: '#666', fontWeight: '600' },
  filterTextActive: { color: '#FFF' },
  
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 10, fontStyle: 'italic' },
  
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 15, marginBottom: 10, paddingLeft: 5 },
  sectionHeaderText: { fontSize: 14, fontWeight: '600', color: '#666' },

  transactionItem: { backgroundColor: '#FFF', padding: 15, borderRadius: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  categoryIcon: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  transactionTitle: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  transactionCategory: { color: '#999', fontSize: 12, marginTop: 2 },
  transactionAmount: { fontWeight: 'bold', fontSize: 15 },
  
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { backgroundColor: '#F8F9FA', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, minHeight: 400, elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: -5 }, shadowRadius: 10 },
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
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 15, backgroundColor: '#ffebee', borderWidth: 1, borderColor: '#ffcdd2' },
  deleteBtnText: { color: '#e74c3c', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});