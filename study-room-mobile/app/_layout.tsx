/* app/_layout.tsx -- NO LONGER USED
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { UserProvider } from '@/context/UserContext';
import AppNavigator from '@/navigation/AppNavigator'; 

// Prevent the splash screen from auto-hiding before fonts are loaded
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'BebasNeue-Regular': require('@/assets/fonts/BebasNeue-Regular.ttf'),
    'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
  });

  // Once fonts are ready, hide splash
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Don’t render UI until fonts finish loading
  if (!fontsLoaded) {
    return null;
  }

  return (
    <UserProvider>
      {/* Stack automatically maps all route files in /app/ }
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      />
    </UserProvider>
  );
}

*/