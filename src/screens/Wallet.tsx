import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Modal,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Tipagem atualizada com mais detalhes
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

// Dados de exemplo enriquecidos
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'Salário Mensal', type: 'up', amount: '5.000,00', category: 'Trabalho', date: '05 Nov 2025', time: '09:00', description: 'Pagamento referente ao mês de Outubro.' },
  { id: '2', title: 'Supermercado', type: 'down', amount: '450,00', category: 'Alimentação', date: '07 Nov 2025', time: '18:30', description: 'Compras do mês no Continente.' },
  { id: '3', title: 'Netflix', type: 'down', amount: '55,90', category: 'Lazer', date: '10 Nov 2025', time: '10:15', description: 'Assinatura mensal Premium.' },
  { id: '4', title: 'Freelance', type: 'up', amount: '800,00', category: 'Extra', date: '12 Nov 2025', time: '14:00', description: 'Criação de website para cliente local.' },
  { id: '5', title: 'Uber', type: 'down', amount: '24,90', category: 'Transporte', date: '13 Nov 2025', time: '22:45', description: 'Viagem de volta para casa.' },
  { id: '6', title: 'Spotify', type: 'down', amount: '19,90', category: 'Lazer', date: '15 Nov 2025', time: '08:00', description: 'Assinatura de música.' },
  { id: '7', title: 'Aluguel', type: 'down', amount: '1.200,00', category: 'Moradia', date: '15 Nov 2025', time: '11:00', description: 'Pagamento da renda do apartamento.' },
  { id: '8', title: 'Venda Teclado', type: 'up', amount: '150,00', category: 'Vendas', date: '18 Nov 2025', time: '16:20', description: 'Vendido no OLX.' },
];

// ADICIONADO: { route, navigation } para conseguir receber os dados da outra tela
export default function Wallet({ route, navigation }: any) {
  const PRIMARY_COLOR = '#6200ee';
  const GREEN_COLOR = '#27ae60';
  const RED_COLOR = '#e74c3c';

  // Estados
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [filter, setFilter] = useState<'all' | 'up' | 'down'>('all');
  
  // Estados do Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // =========================================================
  // ADICIONADO: Lógica para escutar eventos de navegação
  // =========================================================
  useEffect(() => {
    // 1. Receber e adicionar NOVA TRANSAÇÃO
    if (route?.params?.novaTransacao) {
      const novaTx = route.params.novaTransacao;
      
      setTransactions(prevTransactions => {
        const jaExiste = prevTransactions.find(t => t.id === novaTx.id);
        if (jaExiste) return prevTransactions;
        return [novaTx, ...prevTransactions];
      });

      navigation.setParams({ novaTransacao: undefined });
    }

    // 2. ABRIR MODAL AUTOMATICAMENTE (Vindo da Home)
    if (route?.params?.openTransaction) {
      const txToOpen = route.params.openTransaction;
      
      // Define a transação selecionada e abre o modal imediatamente
      setSelectedTx(txToOpen);
      setModalVisible(true);

      // Limpa o parâmetro para não ficar abrindo sozinho ao voltar pra aba
      navigation.setParams({ openTransaction: undefined });
    }
  }, [route?.params?.novaTransacao, route?.params?.openTransaction]);
  // =========================================================

  // Filtragem da lista
  const filteredData = transactions.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  // Ações do Modal
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
      setTransactions(transactions.filter(t => t.id !== selectedTx.id));
      closeDetails();
    }
  };

  // Renderização de cada item da lista
  const renderItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity 
      style={styles.transactionItem} 
      activeOpacity={0.7}
      onPress={() => openDetails(item)}
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
        {item.type === 'up' ? '+' : '-'}R$ {item.amount}
      </Text>
    </TouchableOpacity>
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
          style={[styles.filterBtn, filter === 'all' && { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }]} 
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Tudo</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'up' && { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }]} 
          onPress={() => setFilter('up')}
        >
          <Text style={[styles.filterText, filter === 'up' && styles.filterTextActive]}>Entradas</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'down' && { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }]} 
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
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>
        }
      />

      {/* =================================================== */}
      {/* MODAL DE DETALHES DA TRANSAÇÃO */}
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
  container: { 
    flex: 1, 
    backgroundColor: '#F2F4F7', 
    paddingTop: 60 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  
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
  filterText: { color: '#666', fontWeight: '600' },
  filterTextActive: { color: '#FFF' },

  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40, fontStyle: 'italic' },
  
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
    backgroundColor: '#F8F9FA', // Fundo ligeiramente cinza para destacar o quadro de detalhes
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