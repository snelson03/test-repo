import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { useFonts } from 'expo-font';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  const [fontsLoaded] = useFonts({
    'BebasNeue-Regular': require('./assets/fonts/BebasNeue-Regular.ttf'),
    'DMSans': require('./assets/fonts/DMSans.ttf'),
  });

  if (!fontsLoaded) {
    // Optional: show a loader while font is loading
    return <View><Text>Loading...</Text></View>;
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}


  