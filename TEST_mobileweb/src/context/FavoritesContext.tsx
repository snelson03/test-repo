import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@/context/UserContext";
import { usersAPI, buildingsAPI } from "@/utils/api";
import type { Room } from "@/utils/api";

// define what a favorite looks like
export interface FavoriteItem {
  name: string;
  status?: string;
  tstatus?: string;
  roomId?: number; // Add room ID for API operations
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

  // load favorites from API when app starts OR when logged-in user switches
  useEffect(() => {
    (async () => {
      await loadFavoritesForUser();
    })();
  }, [user?.email]); //  reload list when a different user logs in

  //  loads favorites only for the currently logged-in user
  const loadFavoritesForUser = async () => {
    if (!user) {
      setFavorites([]); // no logged-in user = no favorites
      return;
    }
    try {
      const [favoriteRooms, buildingsData] = await Promise.all([
        usersAPI.getFavorites(),
        buildingsAPI.getAll(),
      ]);

      // Create building map
      const buildingMap = new Map<number, string>();
      buildingsData.forEach((b) => buildingMap.set(b.id, b.name));

      // Convert API rooms to FavoriteItem format
      const convertedFavorites: FavoriteItem[] = favoriteRooms.map((room) => {
        const buildingName =
          buildingMap.get(room.building_id) || "Unknown Building";
        const roomName = `${buildingName} ${room.room_number}`;
        const status = room.is_available ? "available" : "occupied";
        return {
          name: roomName,
          status,
          tstatus: status.charAt(0).toUpperCase() + status.slice(1),
          roomId: room.id,
        };
      });

      setFavorites(convertedFavorites);
    } catch (e) {
      console.log("Error loading favorites:", e);
      setFavorites([]);
    }
  };

  // add new favorite via API
  const addFavorite = async (room: FavoriteItem) => {
    if (!user || !room.roomId) return; // ensures user exists and room has ID

    try {
      await usersAPI.addFavorite(room.roomId);
      // Reload favorites to get updated list
      await loadFavoritesForUser();
    } catch (e) {
      console.log("Error adding favorite:", e);
    }
  };

  // remove favorite via API
  const removeFavorite = async (roomName: string) => {
    if (!user) return; // ensures user exists

    try {
      // Find the room ID from the favorite name
      const favorite = favorites.find((f) => f.name === roomName);
      if (favorite?.roomId) {
        await usersAPI.removeFavorite(favorite.roomId);
        // Reload favorites to get updated list
        await loadFavoritesForUser();
      }
    } catch (e) {
      console.log("Error removing favorite:", e);
    }
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
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
