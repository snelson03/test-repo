// app navigation file 
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '@/screens/HomeScreen';
import FindRoomScreen from '@/screens/FindRoomScreen';
import CampusMapScreen from '@/screens/CampusMapScreen';
import FavoritesScreen from '@/screens/FavoritesScreen';
import PreferencesScreen from '@/screens/PreferencesScreen';

// setting up app pages
export type RootStackParamList = {
  Home: undefined;
  FindRoom: undefined;
  CampusMap: undefined;
  Favorites: undefined;
  Preferences: undefined;
};

const Stack = createNativeStackNavigator();

// setting up navigation routes for pages
export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="FindRoom" 
        component={FindRoomScreen} 
        options={{ title: 'Find a Room' }} 
      />
      <Stack.Screen 
        name="CampusMap" 
        component={CampusMapScreen} 
        options={{ title: 'Campus Map' }} 
      />
      <Stack.Screen 
        name="Favorites" 
        component={FavoritesScreen} 
        options={{ title: 'Favorites' }} 
      />
      <Stack.Screen 
        name="Preferences" 
        component={PreferencesScreen} 
        options={{ title: 'Preferences' }} 
      />
    </Stack.Navigator>
  );
}
