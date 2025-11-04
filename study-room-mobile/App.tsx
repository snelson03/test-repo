// App.tsx file
// Imports fonts from assets and navigation container
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { useFonts } from 'expo-font';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  // Import fonts
  const [fontsLoaded] = useFonts({
    'BebasNeue-Regular': require('./assets/fonts/BebasNeue-Regular.ttf'),
    'Poppins': require('./assets/fonts/Poppins-Light.ttf'),
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
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}


  