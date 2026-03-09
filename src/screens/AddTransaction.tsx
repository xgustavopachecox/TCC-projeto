import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

const hoje = new Date();
const dia = String(hoje.getDate()).padStart(2, '0');
const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Mês começa no 0
const ano = hoje.getFullYear();
const dataAtual = `${dia}/${mes}/${ano}`;

// Categorias separadas por tipo
const EXPENSE_CATEGORIES = [
  { id: 'e1', name: 'Alimentação', icon: 'fast-food-outline' },
  { id: 'e2', name: 'Transporte', icon: 'car-outline' },
  { id: 'e3', name: 'Contas', icon: 'document-text-outline' },
  { id: 'e4', name: 'Lazer', icon: 'game-controller-outline' },
  { id: 'e5', name: 'Saúde', icon: 'medkit-outline' },
  { id: 'e6', name: 'Outros', icon: 'ellipsis-horizontal-circle-outline' },
];

const INCOME_CATEGORIES = [
  { id: 'i1', name: 'Salário', icon: 'cash-outline' },
  { id: 'i2', name: 'Vendas', icon: 'pricetag-outline' },
  { id: 'i3', name: 'Investimentos', icon: 'trending-up-outline' },
  { id: 'i4', name: 'Pix', icon: 'phone-portrait-outline' },
  { id: 'i5', name: 'Outros', icon: 'ellipsis-horizontal-circle-outline' },
];

export default function AddTransaction() {
  const navigation = useNavigation<any>();
  
  // Cor principal da paleta (Roxo)
  const PRIMARY_COLOR = '#6200ee';
  
  // Estados
  const [type, setType] = useState<'down' | 'up'>('down'); 
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('e1');
  
  // Estados da Data
  const [dateText, setDateText] = useState(dataAtual);
  const [dateObj, setDateObj] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Muda as categorias visíveis dependendo se é Entrada ou Saída
  const currentCategories = type === 'up' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // Efeito para resetar a categoria quando muda o tipo
  useEffect(() => {
    if (type === 'up') setSelectedCategory('i1');
    else setSelectedCategory('e1');
  }, [type]);

  // Função para formatar o valor como Moeda (Dinheiro)
  const handleAmountChange = (text: string) => {
    let cleaned = text.replace(/\D/g, ''); // Remove tudo que não for número
    if (cleaned === '') {
      setAmount('');
      return;
    }
    // Converte para decimal
    let value = (parseInt(cleaned, 10) / 100).toFixed(2);
    // Adiciona os pontos e a vírgula
    value = value.replace('.', ',');
    value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    setAmount(value);
  };

  // Função para formatar a data manualmente (Máscara DD/MM/YYYY)
  const handleDateTextChange = (text: string) => {
    let cleaned = text.replace(/\D/g, '');
    let masked = cleaned;
    
    if (cleaned.length > 2) {
      masked = cleaned.replace(/^(\d{2})(\d)/, '$1/$2');
    }
    if (cleaned.length > 4) {
      masked = masked.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
    }
    
    setDateText(masked.substring(0, 10)); // Limita a 10 caracteres
  };

  // Função quando escolhe a data no Calendário
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios'); // No iOS o picker fica sempre visível, no Android fecha
    if (selectedDate) {
      setDateObj(selectedDate);
      // Formatar para DD/MM/YYYY
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      setDateText(`${day}/${month}/${year}`);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    // Se clicar na mesma categoria, desseleciona. Caso contrário, seleciona a nova.
    setSelectedCategory(prev => prev === categoryId ? '' : categoryId);
  };

  const handleSave = () => {
    console.log({ type, amount, title, selectedCategory, date: dateText });
    navigation.navigate('Início');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* CABEÇALHO COM A COR PRINCIPAL */}
        <View style={[styles.header, { backgroundColor: PRIMARY_COLOR }]}>
          <Text style={styles.headerTitle}>Nova {type === 'up' ? 'Entrada' : 'Saída'}</Text>
          <Text style={styles.headerSubtitle}>
            {type === 'up' ? 'Registe um novo ganho' : 'Registe uma nova despesa'}
          </Text>
        </View>

        {/* CONTEÚDO */}
        <View style={styles.bodyContent}>
          <View style={styles.card}>
            
            {/* Seletor de Tipo (Apenas estes ficam Verde/Vermelho) */}
            <View style={styles.typeContainer}>
              <TouchableOpacity 
                style={[styles.typeButton, type === 'up' && styles.typeButtonActiveUp]}
                onPress={() => setType('up')}
              >
                <Ionicons name="arrow-up-circle" size={24} color={type === 'up' ? '#FFF' : '#27ae60'} />
                <Text style={[styles.typeText, type === 'up' && styles.typeTextActive]}>Entrada</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.typeButton, type === 'down' && styles.typeButtonActiveDown]}
                onPress={() => setType('down')}
              >
                <Ionicons name="arrow-down-circle" size={24} color={type === 'down' ? '#FFF' : '#e74c3c'} />
                <Text style={[styles.typeText, type === 'down' && styles.typeTextActive]}>Saída</Text>
              </TouchableOpacity>
            </View>

            {/* Valor (Com máscara e cor principal) */}
            <View style={styles.amountContainer}>
              <Text style={[styles.currencySymbol, { color: PRIMARY_COLOR }]}>R$</Text>
              <TextInput 
                style={[styles.amountInput, { color: PRIMARY_COLOR }]}
                placeholder="0,00"
                placeholderTextColor="#A0A0A0"
                keyboardType="numeric"
                value={amount}
                onChangeText={handleAmountChange}
              />
            </View>

            {/* Descrição */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descrição</Text>
              <TextInput 
                style={styles.textInput}
                placeholder={type === 'up' ? "Ex: Salário, Pix..." : "Ex: Supermercado, Uber..."}
                placeholderTextColor="#A0A0A0"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Data (Com máscara e Calendário) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Data</Text>
              <View style={styles.dateInputContainer}>
                <TextInput 
                  style={styles.dateInput}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="numeric"
                  value={dateText}
                  onChangeText={handleDateTextChange}
                  maxLength={10}
                />
                <TouchableOpacity 
                  style={styles.calendarButton} 
                  onPress={() => setShowPicker(true)}
                >
                  <Ionicons name="calendar" size={24} color={PRIMARY_COLOR} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Seletor de Categorias (Dinâmico) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Categoria</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                {currentCategories.map((cat) => (
                  <TouchableOpacity 
                    key={cat.id} 
                    style={[
                      styles.categoryChip,
                      selectedCategory === cat.id && { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }
                    ]}
                    onPress={() => handleCategoryPress(cat.id)}
                  >
                    <Ionicons 
                      name={cat.icon as any} 
                      size={20} 
                      color={selectedCategory === cat.id ? '#FFF' : '#666'} 
                    />
                    <Text style={[
                      styles.categoryText,
                      selectedCategory === cat.id && styles.categoryTextActive
                    ]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Botão de Guardar */}
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: PRIMARY_COLOR }]} 
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* Modal Nativo do Calendário */}
        {showPicker && (
          <DateTimePicker
            value={dateObj}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7' },
  
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 14, color: '#E0E0E0', marginTop: 5 },

  bodyContent: { 
    paddingHorizontal: 20,
    marginTop: -30, 
    paddingBottom: 120, 
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },

  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginBottom: 25,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    gap: 8,
  },
  typeButtonActiveUp: { backgroundColor: '#27ae60', borderColor: '#27ae60' },
  typeButtonActiveDown: { backgroundColor: '#e74c3c', borderColor: '#e74c3c' },
  typeText: { fontSize: 16, fontWeight: '600', color: '#666' },
  typeTextActive: { color: '#FFF' },

  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 25,
  },
  currencySymbol: { fontSize: 28, fontWeight: 'bold', marginRight: 10 },
  amountInput: { fontSize: 44, fontWeight: 'bold', minWidth: 100, textAlign: 'center' },

  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8 },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },

  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
  },
  dateInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  calendarButton: {
    padding: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
  },

  categoryScroll: { gap: 10, paddingVertical: 5 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  categoryText: { color: '#666', fontWeight: '500' },
  categoryTextActive: { color: '#FFF' },

  saveButton: {
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
  },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});