import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadFavorites, saveFavorites } from '@/utils/storage';

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
}

// create context with default value as null until provided
const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]); // typed favorites array

  // load favorites from async storage when app starts
  useEffect(() => {
    (async () => {
      const stored = await loadFavorites();
      setFavorites(stored || []); // fallback to empty if null
    })();
  }, []);

  // add new favorite and save to local storage
  const addFavorite = async (room: FavoriteItem) => {
    const updated = [...favorites, room];
    setFavorites(updated);
    await saveFavorites(updated);
  };

  // remove favorite by name and save new list
  const removeFavorite = async (roomName: string) => {
    const updated = favorites.filter((f) => f.name !== roomName);
    setFavorites(updated);
    await saveFavorites(updated);
  };

  // provide all functions and favorites list to children
  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite }}>
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
