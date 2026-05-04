import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

// 1. IMPORTAMOS O NOSSO COFRE CENTRAL
import { useTransactions } from '../context/TransactionContext';
import { useUser } from '../context/UserContext';

const hoje = new Date();
const dia = String(hoje.getDate()).padStart(2, '0');
const mes = String(hoje.getMonth() + 1).padStart(2, '0');
const ano = hoje.getFullYear();
const dataAtual = `${dia}/${mes}/${ano}`;

export default function AddTransaction() {
  const navigation = useNavigation<any>();
  const PRIMARY_COLOR = '#6200ee';

  // 2. PUXAMOS A FUNÇÃO DE GUARDAR DO COFRE
  const { addTransaction } = useTransactions();
  const { categories } = useUser();

  const [type, setType] = useState<'down' | 'up'>('down');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('e1');
  const [dateText, setDateText] = useState(dataAtual);
  const [dateObj, setDateObj] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const currentCategories = categories.filter(c => c.type === type);

  useEffect(() => {
    const cats = categories.filter(c => c.type === type);
    if (cats.length > 0) {
      setSelectedCategory(cats[0].id);
    }
  }, [type, categories]);

  const handleAmountChange = (text: string) => {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned === '') {
      setAmount('');
      return;
    }
    let value = (parseInt(cleaned, 10) / 100).toFixed(2);
    value = value.replace('.', ',');
    value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    setAmount(value);
  };

  const handleDateTextChange = (text: string) => {
    let cleaned = text.replace(/\D/g, '');
    let masked = cleaned;
    if (cleaned.length > 2) masked = cleaned.replace(/^(\d{2})(\d)/, '$1/$2');
    if (cleaned.length > 4) masked = masked.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
    setDateText(masked.substring(0, 10));
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateObj(selectedDate);
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      setDateText(`${day}/${month}/${year}`);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(prev => prev === categoryId ? '' : categoryId);
  };

  const handleSave = () => {
    if (!title || !amount || amount === '0,00') {
      Alert.alert('Atenção', 'Por favor, preencha a descrição e o valor.');
      return;
    }

    const catObj = currentCategories.find(c => c.id === selectedCategory);
    const categoryName = catObj ? catObj.name : 'Outros';

    // Construir o objeto real da transação
    const newTx = {
      id: Math.random().toString(36).substring(7),
      title: categoryName,
      type: type,
      amount: amount,
      category: selectedCategory,
      date: dateText,
      description: title
    };

    Alert.alert(
      'Sucesso!',
      'Transação adicionada com sucesso.',
      [
        {
          text: 'OK',
          onPress: () => {
            // 3. GUARDAMOS NO COFRE CENTRAL
            addTransaction(newTx);

            setAmount('');
            setTitle('');
            setDateText(dataAtual);

            // 4. NAVEGAMOS DE VOLTA (Sem precisar de enviar parâmetros!)
            navigation.navigate('Início');
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={[styles.header, { backgroundColor: PRIMARY_COLOR }]}>
          <Text style={styles.headerTitle}>Nova {type === 'up' ? 'Entrada' : 'Saída'}</Text>
          <Text style={styles.headerSubtitle}>{type === 'up' ? 'Registe um novo ganho' : 'Registe uma nova despesa'}</Text>
        </View>

        <View style={styles.bodyContent}>
          <View style={styles.card}>
            <View style={styles.typeContainer}>
              <TouchableOpacity style={[styles.typeButton, type === 'up' && styles.typeButtonActiveUp]} onPress={() => setType('up')}>
                <Ionicons name="arrow-up-circle" size={24} color={type === 'up' ? '#FFF' : '#27ae60'} />
                <Text style={[styles.typeText, type === 'up' && styles.typeTextActive]}>Entrada</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.typeButton, type === 'down' && styles.typeButtonActiveDown]} onPress={() => setType('down')}>
                <Ionicons name="arrow-down-circle" size={24} color={type === 'down' ? '#FFF' : '#e74c3c'} />
                <Text style={[styles.typeText, type === 'down' && styles.typeTextActive]}>Saída</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Categoria</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                {currentCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryChip, selectedCategory === cat.id && { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }]}
                    onPress={() => handleCategoryPress(cat.id)}
                  >
                    {cat.isDefault ? (
                      <Ionicons name={cat.icon as any} size={20} color={selectedCategory === cat.id ? '#FFF' : '#666'} />
                    ) : (
                      <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: selectedCategory === cat.id ? '#FFF' : '#CCC', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: selectedCategory === cat.id ? PRIMARY_COLOR : '#FFF', fontSize: 12, fontWeight: 'bold' }}>{cat.name.charAt(0).toUpperCase()}</Text>
                      </View>
                    )}
                    <Text style={[styles.categoryText, selectedCategory === cat.id && styles.categoryTextActive]}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descrição</Text>
              <TextInput style={styles.textInput} placeholder={type === 'up' ? "Ex: Salário, Pix..." : "Ex: Supermercado, Uber..."} placeholderTextColor="#A0A0A0" value={title} onChangeText={setTitle} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Data</Text>
              <View style={styles.dateInputContainer}>
                <TextInput style={styles.dateInput} placeholder="DD/MM/AAAA" placeholderTextColor="#A0A0A0" keyboardType="numeric" value={dateText} onChangeText={handleDateTextChange} maxLength={10} />
                <TouchableOpacity style={styles.calendarButton} onPress={() => setShowPicker(true)}>
                  <Ionicons name="calendar" size={24} color={PRIMARY_COLOR} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Valor</Text>
              <View style={styles.amountContainer}>
                <Text style={[styles.currencySymbol, { color: PRIMARY_COLOR }]}>R$</Text>
                <TextInput style={[styles.amountInput, { color: PRIMARY_COLOR }]} placeholder="0,00" placeholderTextColor="#A0A0A0" keyboardType="numeric" value={amount} onChangeText={handleAmountChange} />
              </View>
            </View>

            <TouchableOpacity style={[styles.saveButton, { backgroundColor: PRIMARY_COLOR }]} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showPicker && <DateTimePicker value={dateObj} mode="date" display="default" onChange={onDateChange} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7' },
  header: { paddingTop: 80, paddingBottom: 40, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 14, color: '#E0E0E0', marginTop: 5 },
  bodyContent: { paddingHorizontal: 20, marginTop: -30, paddingBottom: 120 },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10 },
  typeContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 15, marginBottom: 25 },
  typeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 15, borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: '#FAFAFA', gap: 8 },
  typeButtonActiveUp: { backgroundColor: '#27ae60', borderColor: '#27ae60' },
  typeButtonActiveDown: { backgroundColor: '#e74c3c', borderColor: '#e74c3c' },
  typeText: { fontSize: 16, fontWeight: '600', color: '#666' },
  typeTextActive: { color: '#FFF' },
  amountContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  currencySymbol: { fontSize: 28, fontWeight: 'bold', marginRight: 10 },
  amountInput: { fontSize: 44, fontWeight: 'bold', minWidth: 100, textAlign: 'center' },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8 },
  textInput: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: '#333' },
  dateInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12 },
  dateInput: { flex: 1, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: '#333' },
  calendarButton: { padding: 12, borderLeftWidth: 1, borderLeftColor: '#E0E0E0' },
  categoryScroll: { gap: 10, paddingVertical: 5 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E0E0E0', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, gap: 8 },
  categoryText: { color: '#666', fontWeight: '500' },
  categoryTextActive: { color: '#FFF' },
  saveButton: { borderRadius: 15, paddingVertical: 16, alignItems: 'center', marginTop: 10, elevation: 2, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 5 },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});