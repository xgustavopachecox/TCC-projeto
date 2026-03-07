import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Tipagem para os Cofrinhos (Objetivos)
type Goal = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  icon: string;
  color: string;
};

// Dados de exemplo
const GOALS: Goal[] = [
  { id: '1', title: 'Viagem a Paris', targetAmount: 15000, currentAmount: 4500, icon: 'airplane-outline', color: '#3498db' },
  { id: '2', title: 'Reserva de Emergência', targetAmount: 20000, currentAmount: 20000, icon: 'shield-checkmark-outline', color: '#27ae60' },
  { id: '3', title: 'Comprar Carro', targetAmount: 40000, currentAmount: 8500, icon: 'car-outline', color: '#e74c3c' },
  { id: '4', title: 'Novo Computador', targetAmount: 8000, currentAmount: 2400, icon: 'laptop-outline', color: '#9b59b6' },
];

export default function Goals() {
  const PRIMARY_COLOR = '#6200ee';

  // --- ESTADOS DO MODAL (GERIR COFRINHO) ---
  const [modalVisible, setModalVisible] = useState(false);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [inputValue, setInputValue] = useState('');

  // --- ESTADOS DO MODAL (CRIAR NOVO COFRINHO) ---
  const [newGoalModalVisible, setNewGoalModalVisible] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');

  // Calcula o total guardado juntando todos os cofrinhos
  const totalSaved = GOALS.reduce((acc, goal) => acc + goal.currentAmount, 0);

  // Formatar dinheiro (R$ 1.000,00)
  const formatCurrency = (val: number) => {
    let value = val.toFixed(2).replace('.', ',');
    return 'R$ ' + value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  };

  // Lógica para abrir o modal de gestão
  const openModal = (goal: Goal) => {
    setActiveGoal(goal);
    setInputValue(''); // Limpa o input sempre que abre
    setModalVisible(true);
  };

  // Lógica para fechar o modal de gestão
  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setActiveGoal(null), 300); // Aguarda a animação fechar para limpar
  };

  // Formatação do input (Máscara de dinheiro em tempo real)
  const handleAmountChange = (text: string) => {
    let cleaned = text.replace(/\D/g, ''); // Remove tudo que não for número
    if (cleaned === '') {
      setInputValue('');
      return;
    }
    let value = (parseInt(cleaned, 10) / 100).toFixed(2);
    value = value.replace('.', ',');
    value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    setInputValue(value);
  };

  // Ações dos botões do modal de gestão
  const handleAddMoney = () => {
    console.log(`Adicionar R$ ${inputValue} ao cofrinho: ${activeGoal?.title}`);
    closeModal();
  };

  const handleRemoveMoney = () => {
    console.log(`Retirar R$ ${inputValue} do cofrinho: ${activeGoal?.title}`);
    closeModal();
  };

  // --- LÓGICA DO NOVO COFRINHO ---
  const openNewGoalModal = () => {
    setNewGoalTitle('');
    setNewGoalAmount('');
    setNewGoalModalVisible(true);
  };

  const closeNewGoalModal = () => {
    setNewGoalModalVisible(false);
  };

  const handleNewGoalAmountChange = (text: string) => {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned === '') {
      setNewGoalAmount('');
      return;
    }
    let value = (parseInt(cleaned, 10) / 100).toFixed(2);
    value = value.replace('.', ',');
    value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    setNewGoalAmount(value);
  };

  const handleCreateGoal = () => {
    console.log(`Criar novo cofrinho: ${newGoalTitle} com meta de R$ ${newGoalAmount}`);
    closeNewGoalModal();
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* CABEÇALHO */}
        <View style={[styles.header, { backgroundColor: PRIMARY_COLOR }]}>
          <Text style={styles.headerTitle}>Cofrinhos</Text>
          <Text style={styles.headerSubtitle}>Poupe para os seus sonhos</Text>
        </View>

        <View style={styles.bodyContent}>
          
          {/* CARTÃO DE RESUMO TOTAL */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.iconBg}>
                <Ionicons name="lock-closed" size={24} color={PRIMARY_COLOR} />
              </View>
              <Text style={styles.summaryLabel}>Total Guardado</Text>
            </View>
            <Text style={styles.summaryValue}>{formatCurrency(totalSaved)}</Text>
            <Text style={styles.summarySubText}>Distribuído em {GOALS.length} cofrinhos</Text>
          </View>

          {/* LISTA DE COFRINHOS */}
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Os Meus Objetivos</Text>
            <TouchableOpacity onPress={openNewGoalModal}>
              <Ionicons name="add-circle" size={28} color={PRIMARY_COLOR} />
            </TouchableOpacity>
          </View>

          {GOALS.map((goal) => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const isCompleted = progress === 100;

            return (
              <TouchableOpacity 
                key={goal.id} 
                style={styles.goalCard} 
                activeOpacity={0.7}
                onPress={() => openModal(goal)}
              >
                <View style={styles.goalHeader}>
                  <View style={styles.goalTitleContainer}>
                    <View style={[styles.goalIcon, { backgroundColor: goal.color + '20' }]}>
                      <Ionicons name={goal.icon as any} size={20} color={goal.color} />
                    </View>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                  </View>
                  <Text style={[styles.percentageText, { color: isCompleted ? '#27ae60' : PRIMARY_COLOR }]}>
                    {progress.toFixed(0)}%
                  </Text>
                </View>

                {/* Barra de Progresso Personalizada */}
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${progress}%`, backgroundColor: isCompleted ? '#27ae60' : goal.color }
                    ]} 
                  />
                </View>

                <View style={styles.goalFooter}>
                  <Text style={styles.amountText}>
                    <Text style={styles.currentAmount}>{formatCurrency(goal.currentAmount)}</Text>
                    <Text style={styles.targetAmount}> / {formatCurrency(goal.targetAmount)}</Text>
                  </Text>
                  
                  {isCompleted && (
                    <View style={styles.completedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="#27ae60" />
                      <Text style={styles.completedText}>Concluído</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

        </View>
      </ScrollView>

      {/* --- MODAL (BOTTOM SHEET) PARA GERIR COFRINHO --- */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeModal} />
          
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />

            {activeGoal && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalGoalInfo}>
                    <View style={[styles.goalIcon, { backgroundColor: activeGoal.color + '20' }]}>
                      <Ionicons name={activeGoal.icon as any} size={24} color={activeGoal.color} />
                    </View>
                    <View>
                      <Text style={styles.modalGoalTitle}>{activeGoal.title}</Text>
                      <Text style={styles.modalGoalAmount}>{formatCurrency(activeGoal.currentAmount)} guardados</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#999" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalInputLabel}>Valor da operação</Text>
                <View style={styles.modalInputContainer}>
                  <Text style={styles.modalCurrencySymbol}>R$</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="0,00"
                    placeholderTextColor="#A0A0A0"
                    keyboardType="numeric"
                    value={inputValue}
                    onChangeText={handleAmountChange}
                    autoFocus={true}
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.removeBtn]}
                    onPress={handleRemoveMoney}
                  >
                    <Ionicons name="remove-circle-outline" size={20} color="#e74c3c" />
                    <Text style={styles.removeBtnText}>Retirar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.addBtn, { backgroundColor: PRIMARY_COLOR }]}
                    onPress={handleAddMoney}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#FFF" />
                    <Text style={styles.addBtnText}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- MODAL PARA CRIAR NOVO COFRINHO --- */}
      <Modal
        visible={newGoalModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeNewGoalModal}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeNewGoalModal} />
          
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalGoalTitle}>Criar Novo Cofrinho</Text>
              <TouchableOpacity onPress={closeNewGoalModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabelLeft}>Nome do Objetivo</Text>
            <TextInput
              style={styles.textInputFull}
              placeholder="Ex: Viagem, Carro Novo..."
              placeholderTextColor="#A0A0A0"
              value={newGoalTitle}
              onChangeText={setNewGoalTitle}
            />

            <Text style={styles.inputLabelLeft}>Valor da Meta</Text>
            <View style={styles.modalInputContainer}>
              <Text style={styles.modalCurrencySymbol}>R$</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="0,00"
                placeholderTextColor="#A0A0A0"
                keyboardType="numeric"
                value={newGoalAmount}
                onChangeText={handleNewGoalAmountChange}
              />
            </View>

            <TouchableOpacity 
              style={[styles.actionBtn, styles.addBtn, { backgroundColor: PRIMARY_COLOR, width: '100%' }]}
              onPress={handleCreateGoal}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
              <Text style={styles.addBtnText}>Criar Objetivo</Text>
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7' },
  
  header: { paddingTop: 80, paddingBottom: 40, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 14, color: '#E0E0E0', marginTop: 5 },

  bodyContent: { paddingHorizontal: 20, marginTop: -30, paddingBottom: 120 },

  summaryCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, marginBottom: 25, alignItems: 'center' },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  iconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3E5F5', justifyContent: 'center', alignItems: 'center' },
  summaryLabel: { fontSize: 16, color: '#666', fontWeight: '600' },
  summaryValue: { fontSize: 36, fontWeight: 'bold', color: '#333' },
  summarySubText: { fontSize: 13, color: '#999', marginTop: 5 },

  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },

  goalCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  goalTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  goalIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  goalTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  percentageText: { fontSize: 16, fontWeight: 'bold' },

  progressBarBackground: { height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  progressBarFill: { height: '100%', borderRadius: 4 },

  goalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amountText: { fontSize: 14 },
  currentAmount: { fontWeight: 'bold', color: '#333' },
  targetAmount: { color: '#999' },
  completedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8f5e9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  completedText: { fontSize: 12, color: '#27ae60', fontWeight: 'bold' },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    minHeight: 300,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -5 },
    shadowRadius: 10,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalGoalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  modalGoalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalGoalAmount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  closeButton: {
    padding: 5,
  },
  modalInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 10,
    marginBottom: 30,
  },
  modalCurrencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  modalInput: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 120,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 15,
    gap: 8,
  },
  removeBtn: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  removeBtnText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addBtn: {
    elevation: 2,
    shadowColor: '#6200ee',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    paddingTop: 20,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  inputLabelLeft: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    alignSelf: 'flex-start',
    width: '100%',
  },
  textInputFull: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    width: '100%',
    marginBottom: 20,
  },
});