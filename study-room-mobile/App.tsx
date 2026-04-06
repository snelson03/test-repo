// App.tsx file
import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { useFonts } from 'expo-font';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { UserProvider } from './src/context/UserContext';
import { requestNotificationPermission } from './src/utils/notifications';
import { useRoomAvailabilityNotifications } from './src/hooks/useRoomAvailabilityNotifications';
import 'react-native-gesture-handler';

export default function App() {
  console.log('APP TSX IS RUNNING');

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useRoomAvailabilityNotifications();

  const [fontsLoaded] = useFonts({
    'BebasNeue-Regular': require('@/assets/fonts/BebasNeue-Regular.ttf'),
    'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
  });

  if (!fontsLoaded) {
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