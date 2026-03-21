import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider } from './src/contexts/AppContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { COLORS } from './src/constants/theme';

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={COLORS.primary} />
        <AppNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}
