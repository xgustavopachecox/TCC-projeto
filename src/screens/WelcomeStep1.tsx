import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';

export default function WelcomeStep1() {
  const navigation = useNavigation<any>();
  const { userName, updateUserProfile, userBirthDate, userSalary } = useUser();
  
  const [tempName, setTempName] = useState(userName === 'Usuário' ? '' : userName);
  const [tempBirth, setTempBirth] = useState(userBirthDate || '');
  const [tempSalary, setTempSalary] = useState(userSalary || '');

  const PRIMARY_COLOR = '#6200ee';

  const handleBirthChange = (text: string) => {
    let cleaned = text.replace(/\D/g, '');
    let masked = cleaned;
    if (cleaned.length > 2) masked = cleaned.replace(/^(\d{2})(\d)/, '$1/$2');
    if (cleaned.length > 4) masked = masked.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
    setTempBirth(masked.substring(0, 10));
  };

  const handleNext = () => {
    if (!tempName.trim()) {
      Alert.alert('Atenção', 'Por favor, informe seu nome.');
      return;
    }
    
    // Salvar dados no contexto de uma vez só (evita race condition no backend)
    updateUserProfile({
      nome: tempName,
      dataNascimento: tempBirth,
      salarioAtual: tempSalary ? tempSalary.replace(',', '.') : ''
    });

    navigation.navigate('Quiz');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View>
          <View style={styles.header}>
            <Ionicons name="sparkles" size={48} color={PRIMARY_COLOR} />
            <Text style={styles.title}>Bem-vindo ao Finanças!</Text>
            <Text style={styles.subtitle}>
              Vamos personalizar a sua experiência. Os dados abaixo ajudarão nossa Inteligência Artificial a traçar o melhor perfil e dicas para você.
            </Text>
          </View>

          <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Como devemos te chamar?</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Seu nome"
                value={tempName}
                onChangeText={setTempName}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data de Nascimento</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="calendar-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
                value={tempBirth}
                onChangeText={handleBirthChange}
                maxLength={10}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Salário Atual (Opcional)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="cash-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Ex: 5000.00"
                keyboardType="numeric"
                value={tempSalary}
                onChangeText={setTempSalary}
                placeholderTextColor="#999"
              />
            </View>
          </View>
          </View>
        </View>

        <TouchableOpacity style={[styles.nextButton, { backgroundColor: PRIMARY_COLOR }]} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Continuar</Text>
          <Ionicons name="arrow-forward" size={24} color="#FFF" />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 80,
    justifyContent: 'space-between'
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E4E9F2',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  nextButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
