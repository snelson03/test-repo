// app/_layout.tsx
import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Slot, usePathname } from 'expo-router';
import AppNavigator from '@/navigation/AppNavigator';
import { UserProvider } from '@/context/UserContext';
import { SessionExpiryProvider } from '@/context/SessionExpiryContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { RoomAvailabilityProvider } from '@/context/RoomAvailabilityContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import 'react-native-gesture-handler';

// Prevent splash screen from auto-hiding before fonts are loaded
SplashScreen.preventAutoHideAsync();

function ThemedApp() {
  const { isDark } = useTheme();
  const pathname = usePathname();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {pathname === '/reset-password' ? <Slot /> : <AppNavigator />}
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
        <SessionExpiryProvider>
          <FavoritesProvider>
            <RoomAvailabilityProvider>
              <ThemedApp />
            </RoomAvailabilityProvider>
          </FavoritesProvider>
        </SessionExpiryProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
