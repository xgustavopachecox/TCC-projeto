import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Menu() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="grid-outline" size={80} color="#6200ee" />
        <View style={styles.badge}>
            <Ionicons name="bulb" size={20} color="#FFF" />
        </View>
      </View>
      
      <Text style={styles.title}>Menu & IA Advisor</Text>
      <Text style={styles.subtitle}>
        Aqui ficarão as Configurações do App e o acesso exclusivo ao módulo de Inteligência Artificial.
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
    backgroundColor: '#9c27b0', // Um roxo mais escuro/mageta
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