import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import { AuthProvider, useAuthContext } from './src/context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style="light" backgroundColor="#000000" />
      </NavigationContainer>
    </AuthProvider>
  );
}

const RootNavigator = () => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return null;
  }

  return user ? <AppNavigator /> : <AuthNavigator />;
};