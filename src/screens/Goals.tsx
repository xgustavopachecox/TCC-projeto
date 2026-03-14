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

// 1. IMPORTAMOS O COFRE DOS COFRINHOS
import { useGoals, Goal } from '../context/GoalContext';

export default function Goals() {
  const PRIMARY_COLOR = '#6200ee';

  // 2. BUSCAMOS OS DADOS E AS FUNÇÕES DIRETAMENTE DO CONTEXTO
  const { goals, addGoal, updateGoal, deleteGoal, addMoney, removeMoney } = useGoals();

  // --- ESTADOS DO MODAL DE DETALHES (GERIR DINHEIRO) ---
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [inputValue, setInputValue] = useState('');

  // --- ESTADOS DO MODAL DE FORMULÁRIO (CRIAR/EDITAR) ---
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');

  // Calcula o total guardado juntando todos os cofrinhos
  const totalSaved = goals.reduce((acc, goal) => acc + goal.currentAmount, 0);

  const formatCurrency = (val: number) => {
    let value = val.toFixed(2).replace('.', ',');
    return 'R$ ' + value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  };

  const parseCurrencyToNumber = (valStr: string) => {
    return parseFloat(valStr.replace(/\./g, '').replace(',', '.')) || 0;
  };

  // =======================================================
  // LÓGICA DO MODAL DE DETALHES (ADICIONAR/RETIRAR/EXCLUIR)
  // =======================================================
  const openGoalDetails = (goal: Goal) => {
    setActiveGoal(goal);
    setInputValue(''); 
    setDetailsModalVisible(true);
  };

  const closeGoalDetails = () => {
    setDetailsModalVisible(false);
    setTimeout(() => setActiveGoal(null), 300); 
  };

  const handleAmountChange = (text: string) => {
    let cleaned = text.replace(/\D/g, ''); 
    if (cleaned === '') {
      setInputValue('');
      return;
    }
    let value = (parseInt(cleaned, 10) / 100).toFixed(2);
    value = value.replace('.', ',');
    value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    setInputValue(value);
  };

  // Adicionar e Retirar dinheiro através do contexto
  const handleAddMoney = () => {
    const val = parseCurrencyToNumber(inputValue);
    if(val > 0 && activeGoal) {
      addMoney(activeGoal.id, val);
    }
    closeGoalDetails();
  };

  const handleRemoveMoney = () => {
    const val = parseCurrencyToNumber(inputValue);
    if(val > 0 && activeGoal) {
      removeMoney(activeGoal.id, val);
    }
    closeGoalDetails();
  };

  const handleDeleteGoal = () => {
    if (activeGoal) {
      deleteGoal(activeGoal.id);
      closeGoalDetails();
    }
  };

  const handleOpenEdit = () => {
    if (activeGoal) {
      setEditingGoalId(activeGoal.id);
      setFormTitle(activeGoal.title);
      
      let valString = activeGoal.targetAmount.toFixed(2).replace('.', ',');
      valString = valString.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
      setFormAmount(valString);
      
      closeGoalDetails();
      setTimeout(() => setFormModalVisible(true), 300);
    }
  };

  // =======================================================
  // LÓGICA DO MODAL DE FORMULÁRIO (CRIAR E EDITAR META)
  // =======================================================
  const openGoalFormNew = () => {
    setEditingGoalId(null);
    setFormTitle('');
    setFormAmount('');
    setFormModalVisible(true);
  };

  const closeGoalForm = () => {
    setFormModalVisible(false);
  };

  const handleFormAmountChange = (text: string) => {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned === '') {
      setFormAmount('');
      return;
    }
    let value = (parseInt(cleaned, 10) / 100).toFixed(2);
    value = value.replace('.', ',');
    value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    setFormAmount(value);
  };

  const handleSaveGoal = () => {
    const targetVal = parseCurrencyToNumber(formAmount);
    if (!formTitle || targetVal <= 0) return;

    if (editingGoalId) {
      // Edita através do contexto
      updateGoal(editingGoalId, { title: formTitle, targetAmount: targetVal });
    } else {
      // Cria através do contexto
      const newGoal: Goal = {
        id: Math.random().toString(36).substring(7),
        title: formTitle,
        targetAmount: targetVal,
        currentAmount: 0,
        icon: 'star-outline', 
        color: PRIMARY_COLOR 
      };
      addGoal(newGoal);
    }
    closeGoalForm();
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
            <Text style={styles.summarySubText}>Distribuído em {goals.length} cofrinhos</Text>
          </View>

          {/* LISTA DE COFRINHOS */}
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Os Meus Objetivos</Text>
            <TouchableOpacity onPress={openGoalFormNew}>
              <Ionicons name="add-circle" size={28} color={PRIMARY_COLOR} />
            </TouchableOpacity>
          </View>

          {goals.length === 0 && (
            <Text style={styles.emptyText}>Você ainda não tem cofrinhos criados. Comece agora!</Text>
          )}

          {goals.map((goal) => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const isCompleted = progress >= 100;

            return (
              <TouchableOpacity 
                key={goal.id} 
                style={styles.goalCard} 
                activeOpacity={0.7}
                onPress={() => openGoalDetails(goal)}
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

                {/* Barra de Progresso */}
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

      {/* =================================================== */}
      {/* 1. MODAL DE DETALHES (ADICIONAR/RETIRAR DINHEIRO) */}
      {/* =================================================== */}
      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeGoalDetails}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeGoalDetails} />
          
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
                  
                  {/* Ícones de Ação: Editar, Excluir e Fechar */}
                  <View style={styles.modalHeaderActions}>
                    <TouchableOpacity onPress={handleOpenEdit} style={styles.headerIconBtn}>
                      <Ionicons name="pencil" size={22} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDeleteGoal} style={styles.headerIconBtn}>
                      <Ionicons name="trash" size={22} color="#e74c3c" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={closeGoalDetails} style={styles.headerIconBtn}>
                      <Ionicons name="close" size={24} color="#999" />
                    </TouchableOpacity>
                  </View>
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

      {/* =================================================== */}
      {/* 2. MODAL DE FORMULÁRIO (CRIAR E EDITAR COFRINHO) */}
      {/* =================================================== */}
      <Modal
        visible={formModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeGoalForm}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeGoalForm} />
          
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalGoalTitle}>
                {editingGoalId ? 'Editar Cofrinho' : 'Criar Novo Cofrinho'}
              </Text>
              <TouchableOpacity onPress={closeGoalForm} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabelLeft}>Nome do Objetivo</Text>
            <TextInput
              style={styles.textInputFull}
              placeholder="Ex: Viagem, Carro Novo..."
              placeholderTextColor="#A0A0A0"
              value={formTitle}
              onChangeText={setFormTitle}
            />

            <Text style={styles.inputLabelLeft}>Valor da Meta</Text>
            <View style={styles.modalInputContainer}>
              <Text style={styles.modalCurrencySymbol}>R$</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="0,00"
                placeholderTextColor="#A0A0A0"
                keyboardType="numeric"
                value={formAmount}
                onChangeText={handleFormAmountChange}
              />
            </View>

            <TouchableOpacity 
              style={[styles.createGoalBtn, { backgroundColor: PRIMARY_COLOR }]}
              onPress={handleSaveGoal}
            >
              <Ionicons name={editingGoalId ? "save-outline" : "checkmark-circle-outline"} size={20} color="#FFF" />
              <Text style={styles.createGoalBtnText}>
                {editingGoalId ? 'Guardar Alterações' : 'Criar Objetivo'}
              </Text>
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
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20, fontStyle: 'italic' },

  goalCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  goalTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  goalIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  goalTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', flexShrink: 1 },
  percentageText: { fontSize: 16, fontWeight: 'bold', marginLeft: 10 },

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
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
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
    flex: 1,
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15, 
  },
  headerIconBtn: {
    padding: 4,
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
  createGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 15,
    width: '100%',
    marginTop: 10,
    elevation: 2,
    shadowColor: '#6200ee',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
  },
  createGoalBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});