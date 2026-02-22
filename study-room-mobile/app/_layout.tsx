// app/_layout.tsx
import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from '@/navigation/AppNavigator';
import { UserProvider } from '@/context/UserContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import 'react-native-gesture-handler';

// Prevent splash screen from auto-hiding before fonts are loaded
SplashScreen.preventAutoHideAsync();

function ThemedApp() {
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'BebasNeue-Regular': require('@/assets/fonts/BebasNeue-Regular.ttf'),
    'Poppins-Regular': require('@/assets/fonts/Poppins-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <UserProvider>
        <FavoritesProvider>
          <ThemedApp />
        </FavoritesProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
