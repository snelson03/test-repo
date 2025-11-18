import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@/context/UserContext';

// define what a favorite looks like
export interface FavoriteItem {
  name: string;
  status?: string;
  tstatus?: string;
}

// define what the context provides
interface FavoritesContextType {
  favorites: FavoriteItem[];
  addFavorite: (room: FavoriteItem) => Promise<void>;
  removeFavorite: (roomName: string) => Promise<void>;
  loadFavoritesForUser: () => Promise<void>; // refresh favorites whenever user changes
}

// create context with default value as null until provided
const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser(); //  find which user is currently logged in
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]); // typed favorites array

  const storageKey = user ? `favorites_${user.email}` : null;

  // load favorites from async storage when app starts OR when logged-in user switches
  useEffect(() => {
    (async () => {
      await loadFavoritesForUser();
    })();
  }, [user?.email]); //  reload list when a different user logs in

  //  loads favorites only for the currently logged-in user
  const loadFavoritesForUser = async () => {
    if (!storageKey) {
      setFavorites([]); // no logged-in user = no favorites
      return;
    }
    try {
      const stored = await AsyncStorage.getItem(storageKey);
      setFavorites(stored ? JSON.parse(stored) : []); // fallback to empty
    } catch (e) {
      console.log('Error loading favorites:', e);
    }
  };

  // add new favorite and save to local storage 
  const addFavorite = async (room: FavoriteItem) => {
    if (!storageKey) return; // ensures user exists
    const updated = [...favorites, room];
    setFavorites(updated);
    await AsyncStorage.setItem(storageKey, JSON.stringify(updated)); // save to user-specific key
  };

  // remove favorite by name and save new list (per user)
  const removeFavorite = async (roomName: string) => {
    if (!storageKey) return; // ensures user exists
    const updated = favorites.filter((f) => f.name !== roomName);
    setFavorites(updated);
    await AsyncStorage.setItem(storageKey, JSON.stringify(updated)); //save to user-specific key
  };

  // provide all functions and favorites list to children
  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, loadFavoritesForUser }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

// custom hook for using favorites context anywhere
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
