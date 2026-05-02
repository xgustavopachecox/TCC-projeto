import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useUser } from '../context/UserContext';

export default function Login() {
  const { login } = useUser();
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
    })();
  }, []);

  const handleAuth = async () => {
    try {
      const savedBiometrics = await LocalAuthentication.isEnrolledAsync();
      
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentique-se para acessar o Finanças',
        fallbackLabel: 'Usar senha do celular',
        disableDeviceFallback: false,
      });

      if (authResult.success) {
        await login();
      } else {
        Alert.alert('Autenticação falhou', 'Não foi possível confirmar sua identidade.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Ocorreu um erro ao tentar autenticar.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Ionicons name="wallet" size={80} color="#FFF" />
        <Text style={styles.title}>TCC Finanças</Text>
        <Text style={styles.subtitle}>Gestão Financeira Inteligente</Text>
      </View>

      <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
        <Ionicons name="finger-print" size={24} color="#6200ee" style={styles.btnIcon} />
        <Text style={styles.authButtonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    marginTop: 5,
  },
  authButton: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  btnIcon: {
    marginRight: 10,
  },
  authButtonText: {
    color: '#6200ee',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
