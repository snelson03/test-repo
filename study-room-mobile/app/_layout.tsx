// app/_layout.tsx - contains root layout
import { Stack } from 'expo-router';
import React from 'react';
import { UserProvider } from '@/context/UserContext'; 

export default function RootLayout() {
  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </UserProvider>
  );
}
