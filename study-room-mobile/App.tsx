// App.tsx file
// Imports fonts from assets and navigation container
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { useFonts } from 'expo-font';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { UserProvider } from './src/context/UserContext';
import 'react-native-gesture-handler';

export default function App() {
  // Import fonts
  const [fontsLoaded] = useFonts({
    'BebasNeue-Regular': require('@/assets/fonts/BebasNeue-Regular.ttf'),
    'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
  });

  if (!fontsLoaded) {
    // Show a loader while font is loading
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <UserProvider>
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
    </UserProvider>
  );
}


  