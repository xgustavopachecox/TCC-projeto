import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AddTransaction() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="add-circle-outline" size={80} color="#6200ee" />
        <View style={styles.badge}>
            <Ionicons name="pencil" size={20} color="#FFF" />
        </View>
      </View>
      
      <Text style={styles.title}>Nova Transação</Text>
      <Text style={styles.subtitle}>
        O formulário para cadastrar novas Receitas (Entradas) e Despesas (Saídas) será construído aqui.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F4F7',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: -10,
    backgroundColor: '#4caf50', // Verde para indicar "Adicionar"
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#F2F4F7'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '80%',
  },
});