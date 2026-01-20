import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';

export default function App() {
  
  useEffect(() => {
    // Só roda esse comando se for Android
    if (Platform.OS === 'android') {
      // Esconde a barra de navegação (botões virtuais)
      NavigationBar.setVisibilityAsync("hidden");
      // Faz ela aparecer só se arrastar a tela (swipe)
      NavigationBar.setBehaviorAsync("overlay-swipe");
      // Opcional: Deixa a barra transparente quando aparecer
      NavigationBar.setBackgroundColorAsync("rgba(0,0,0,0)"); 
    }
  }, []);

  return (
    <>
      {/* Mudei para "light" para os ícones ficarem brancos em cima do roxo */}
      <StatusBar style="light" backgroundColor="#6200ee" /> 
      <AppNavigator />
    </>
  );
}