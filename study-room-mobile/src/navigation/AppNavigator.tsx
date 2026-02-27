// app navigation file 
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '@/screens/HomeScreen';
import FindRoomScreen from '@/screens/FindRoomScreen';
import CampusMapScreen from '@/screens/CampusMapScreen';
import FavoritesScreen from '@/screens/FavoritesScreen';
import PreferencesScreen from '@/screens/PreferencesScreen';
import RoomDetailsScreen from '@/screens/RoomDetailsScreen';
import LoginScreen from '@/screens/LoginScreen';
import CreateAccountScreen from '../screens/CreateAccountScreen'; 

// setting up app pages
/** Map building id (Campus Map) -> used when navigating from map to Find a Room */
export type MapBuildingId = 'arc' | 'stocker' | 'alden';

export type RootStackParamList = {
  Login: undefined;
  CreateAccount: undefined;
  Home: undefined;
  FindRoom: { buildingIdFromMap?: MapBuildingId } | undefined;
  CampusMap: undefined;
  Favorites: undefined;
  Preferences: undefined;
  RoomDetails: {
    building: 'Stocker Center' | 'ARC' | 'Alden Library';
    roomId: string;
    status: 'available' | 'occupied' | 'offline';
  };
};

const Stack = createNativeStackNavigator();

// setting up navigation routes for pages
export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateAccount"          
        component={CreateAccountScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="FindRoom" 
        component={FindRoomScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="CampusMap" 
        component={CampusMapScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Favorites" 
        component={FavoritesScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Preferences" 
        component={PreferencesScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="RoomDetails"
        component={RoomDetailsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
