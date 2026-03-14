import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';

// 1. Importamos os nossos dois Cofres
import { TransactionProvider } from './src/context/TransactionContext';
import { GoalProvider } from './src/context/GoalContext'; // <-- ADICIONADO AQUI

export default function App() {
  
  useEffect(() => {
    // Esconder a barra de navegação no Android
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("overlay-swipe");
      NavigationBar.setBackgroundColorAsync("rgba(0,0,0,0)"); 
    }
  }, []);

  return (
    // 2. Envolvemos a aplicação com ambos os provedores
    // Um fica "dentro" do outro, assim a app tem acesso a tudo!
    <TransactionProvider>
      <GoalProvider>
        {/* Mudei para "light" para os ícones ficarem brancos em cima do roxo */}
        <StatusBar style="light" backgroundColor="#6200ee" /> 
        <AppNavigator />
      </GoalProvider>
    </TransactionProvider>
  );
}