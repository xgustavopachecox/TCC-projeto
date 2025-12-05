import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
export default function Goals() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="piggy-bank-outline" size={80} color="#6200ee" />
        <View style={styles.badge}>
            <Ionicons name="time" size={20} color="#FFF" />
        </View>
      </View>
      
      <Text style={styles.title}>Cofrinhos em Breve</Text>
      <Text style={styles.subtitle}>
        A funcionalidade de metas e objetivos financeiros está sendo preparada.
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
    backgroundColor: '#26c6da', // Um ciano para diferenciar
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