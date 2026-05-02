import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import AppNavigator from './src/navigation/AppNavigator';
import Login from './src/screens/Login';

// IMPORTAR OS COFRES AQUI
import { TransactionProvider } from './src/context/TransactionContext';
import { GoalProvider } from './src/context/GoalContext';
import { UserProvider, useUser } from './src/context/UserContext'; 

const MainApp = () => {
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return (
      <>
        <StatusBar style="light" backgroundColor="#6200ee" />
        <Login />
      </>
    );
  }

  return (
    <TransactionProvider>
      <GoalProvider>
        <StatusBar style="light" backgroundColor="#6200ee" /> 
        <AppNavigator />
      </GoalProvider>
    </TransactionProvider>
  );
};

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("overlay-swipe");
      NavigationBar.setBackgroundColorAsync("rgba(0,0,0,0)"); 
    }
  }, []);

  return (
    <UserProvider>
      <MainApp />
    </UserProvider>
  );
}