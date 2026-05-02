import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeStep1 from '../screens/WelcomeStep1';
import Quiz from '../screens/Quiz';

const Stack = createNativeStackNavigator();

export default function WelcomeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WelcomeStep1" component={WelcomeStep1} />
      <Stack.Screen name="Quiz" component={Quiz} />
    </Stack.Navigator>
  );
}
