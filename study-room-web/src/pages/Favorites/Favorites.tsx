import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/sidebar";
import "./favorites.css";
import { FaTrash } from "react-icons/fa";
import { usersAPI, buildingsAPI } from "../../utils/api";
import type { Room } from "../../utils/api";

interface FavoriteRoomDisplay {
  id: number;
  building_name: string;
  floor: string;
  status: "available" | "busy" | "offline";
  number: string;
}

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<Room[]>([]);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Convert API room to display format
  const convertToDisplay = (room: Room): FavoriteRoomDisplay => {
    const status: "available" | "busy" | "offline" = room.is_available
      ? "available"
      : "busy";
    return {
      id: room.id,
      building_name: room.building?.name || "Unknown Building",
      floor: room.floor_number ? `${room.floor_number}F` : "N/A",
      status,
      number: room.room_number,
    };
  };

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const [favoriteRooms, buildingsData] = await Promise.all([
          usersAPI.getFavorites(),
          buildingsAPI.getAll(),
        ]);

        // Create a map of building_id to building name
        const buildingMap = new Map<number, string>();
        buildingsData.forEach((b) => buildingMap.set(b.id, b.name));

        // Add building names to rooms
        const roomsWithBuildings = favoriteRooms.map((room) => ({
          ...room,
          building: buildingMap.get(room.building_id)
            ? {
                id: room.building_id,
                name: buildingMap.get(room.building_id)!,
                address:
                  buildingsData.find((b) => b.id === room.building_id)
                    ?.address || null,
                number_of_floors:
                  buildingsData.find((b) => b.id === room.building_id)
                    ?.number_of_floors || null,
              }
            : undefined,
        }));

        setFavorites(roomsWithBuildings);
      } catch (error) {
        console.error("Failed to load favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  // Refresh favorites periodically to get updated status
  useEffect(() => {
    if (favorites.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const updatedFavorites = await usersAPI.getFavorites();
        setFavorites(updatedFavorites);
      } catch (error) {
        console.error("Failed to refresh favorites:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [favorites.length]);

  const removeFavorite = async (roomId: number) => {
    try {
      await usersAPI.removeFavorite(roomId);
      const updated = await usersAPI.getFavorites();
      setFavorites(updated);
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    }
  };

  const getStatusColor = (status: FavoriteRoomDisplay["status"]) => {
    switch (status) {
      case "available":
        return "#2EB159";
      case "busy":
        return "#CA2E2E";
      case "offline":
        return "#9E9E9E";
    }
  };

  const toggleEditMode = () => setEditMode((prev) => !prev);

  return (
    <div className="favorites-page">
      <Sidebar />

      <main className="favorites-container">
        <div className="favorites-header">
          <h2>Favorites</h2>
        </div>

        <div className="favorites-list-wrapper">
          <button className="edit-btn" onClick={toggleEditMode}>
            {editMode ? "Done" : "Edit"}
          </button>

          <ul className="favorites-list3">
            {loading ? (
              <li>Loading favorites...</li>
            ) : favorites.length === 0 ? (
              <li>No favorites yet</li>
            ) : (
              favorites.map((room) => {
                const display = convertToDisplay(room);
                return (
                  <li key={room.id} className="favorite-item">
                    <span className="room-name">
                      {display.building_name}, {display.floor}
                    </span>
                    <div className="room-status">
                      <span
                        className="status-dot"
                        style={{
                          backgroundColor: getStatusColor(display.status),
                        }}
                      ></span>
                      <span className="room-number2">{display.number}</span>
                      {editMode && (
                        <button
                          className="remove-btn"
                          onClick={() => removeFavorite(room.id)}
                        >
                          <FaTrash size={16} color="white" />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Favorites;
