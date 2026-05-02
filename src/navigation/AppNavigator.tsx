import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';


import Home from '../screens/Home';
import Wallet from '../screens/Wallet'; 
import Goals from '../screens/Goals';   
import Advisor from '../screens/Advisor'; 
import AddTransaction from '../screens/AddTransaction'
import Quiz from '../screens/Quiz';

const Tab = createBottomTabNavigator();


const CustomTabBarButton = ({ children, onPress }: any) => (
  <TouchableOpacity
    style={{
      justifyContent: 'center',
      alignItems: 'center',
      ...styles.shadow
    }}
    onPress={onPress}
  >
    <View style={{
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: '#6200ee',
      justifyContent: 'center', 
      alignItems: 'center'      
    }}>
      {children}
    </View>
  </TouchableOpacity>
);

export default function AppNavigator() {
  return (
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: { 
            position: 'absolute',
            bottom: 0,
            left: 20,
            right: 20,
            backgroundColor: '#ffffff',
            borderRadius: 15,
            height: 90,
            ...styles.shadow
          }
        }}
      >
        <Tab.Screen name="Início" component={Home} options={{
          tabBarIcon: ({ focused }) => (
            <View style={{alignItems: 'center', justifyContent: 'center', top: 10}}>
              <Ionicons name={focused ? "home" : "home-outline"} size={25} color={focused ? '#6200ee' : '#748c94'} />
            </View>
          )
        }}/>

        <Tab.Screen name="Extrato" component={Wallet} options={{
          tabBarIcon: ({ focused }) => (
            <View style={{alignItems: 'center', justifyContent: 'center', top: 10}}>
              <Ionicons name={focused ? "wallet" : "wallet-outline"} size={25} color={focused ? '#6200ee' : '#748c94'} />
            </View>
          )
        }}/>

        
        <Tab.Screen 
          name="Adicionar" 
          component={AddTransaction} 
          options={{
            tabBarIcon: ({ focused }) => (
              <View>
                <Ionicons name="add" size={30} color="#FFF" />
              </View>
            ),
            tabBarButton: (props) => (
              <CustomTabBarButton {...props} />
            )
          }}
        />

        <Tab.Screen name="Cofrinhos" component={Goals} options={{
          tabBarIcon: ({ focused }) => (
            <View style={{alignItems: 'center', justifyContent: 'center', top: 10}}>
              <MaterialCommunityIcons name={focused ? "piggy-bank" : "piggy-bank-outline"} size={25} color={focused ? '#6200ee' : '#748c94'} />
            </View>
          )
        }}/>

        <Tab.Screen name="I.A" component={Advisor} options={{
          tabBarIcon: ({ focused }) => (
            <View style={{alignItems: 'center', justifyContent: 'center', top: 10}}>
              <Ionicons name={focused ? "sparkles" : "sparkles-outline"} size={25} color={focused ? '#6200ee' : '#748c94'} />
            </View>
          )
        }}/>

        <Tab.Screen 
          name="Quiz" 
          component={Quiz} 
          options={{ 
            tabBarButton: () => null,
            tabBarItemStyle: { display: 'none' }
          }} 
        />

      </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#7F5DF0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5
  }
});