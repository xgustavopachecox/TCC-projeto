import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import AppNavigator from './src/navigation/AppNavigator';

// IMPORTAR OS COFRES AQUI
import { TransactionProvider } from './src/context/TransactionContext';
import { GoalProvider } from './src/context/GoalContext';
import { UserProvider } from './src/context/UserContext'; // <-- ADICIONADO AQUI

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("overlay-swipe");
      NavigationBar.setBackgroundColorAsync("rgba(0,0,0,0)"); 
    }
  }, []);

  return (
    // A ORDEM IMPORTA: UserProvider no topo!
    <UserProvider>
      <TransactionProvider>
        <GoalProvider>
          <StatusBar style="light" backgroundColor="#6200ee" /> 
          <AppNavigator />
        </GoalProvider>
      </TransactionProvider>
    </UserProvider>
  );
}