import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/sidebar";
import './favorites.css';
import { FaTrash } from "react-icons/fa";

function getCurrentUser() {
  let session, users;

  try {
    session = JSON.parse(localStorage.getItem("mock_user_session") || "{}");
  } catch {
    session = {};
  }

  try {
    users = JSON.parse(localStorage.getItem("users") || "[]");
    if (!Array.isArray(users)) users = [];
  } catch {
    users = [];
  }

  return users.find((u) => u.email === session.email);
}

function saveUser(updatedUser: any) {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const newUsers = users.map((u: any) =>
    u.email === updatedUser.email ? updatedUser : u
  );
  localStorage.setItem("users", JSON.stringify(newUsers));
}

interface FavoriteRoom {
    id: number;
    building_name: string;
    floor: string;
    status: "available" | "busy" | "offline";
    number: number;
}

const defaultFavorites: FavoriteRoom[] = [
    { id: 1, building_name: "Stocker Center", floor: "1F", status: "available", number: 155 },
    { id: 2, building_name: "Stocker Center", floor: "2F", status: "offline", number: 212 },
    { id: 3, building_name: "Stocker Center", floor: "3F", status: "busy", number: 315 },
    { id: 4, building_name: "Academic & Research Center", floor: "1F", status: "available", number: 103 },
    { id: 5, building_name: "Academic & Research Center", floor: "2F", status: "busy", number: 207 },
    { id: 6, building_name: "Alden Library", floor: "1F", status: "available", number: 121 },
];

const Favorites: React.FC = () => {
    const [favorites, setFavorites] = useState<FavoriteRoom[]>([]);
    const [editMode, setEditMode] = useState<boolean>(false);

    
    useEffect(() => {
        const user = getCurrentUser();
        if (!user) return (window.location.href = "/login");

        if (user.favorites === undefined || user.favorites === null) {
            // First login → give defaults
            user.favorites = defaultFavorites;
            saveUser(user);
            setFavorites(defaultFavorites);
        } else {
            setFavorites(user.favorites);
        }
    }, []);

    useEffect(() => {
        if (favorites.length === 0) return;

        const interval = setInterval(() => {
            setFavorites((prev) => {
                if (prev.length === 0) return prev;

                const updated = prev.map((room) => ({
                    ...room,
                    status: ["available", "busy", "offline"][Math.floor(Math.random() * 3)] as FavoriteRoom["status"],
                }));

                const user = getCurrentUser();
                if (user) {
                    user.favorites = updated;
                    saveUser(user);
                }

                return updated;
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [favorites.length]);


    useEffect(() => {
        const handler = () => {
            const user = getCurrentUser();
            if (user?.favorites) {
                setFavorites(user.favorites);
            }
        };

        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, []);

    const removeFavorite = (id: number) => {
        const updated = favorites.filter((room) => room.id !== id);

        setFavorites(updated);

        const user = getCurrentUser();
        if (user) {
            user.favorites = updated;
            saveUser(user);
        }
    };


    const getStatusColor = (status: FavoriteRoom["status"]) => {
        switch (status) {
            case "available": return "#2EB159";
            case "busy": return "#CA2E2E";
            case "offline": return "#9E9E9E";
        }
    };

    const toggleEditMode = () => setEditMode(prev => !prev);

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
                        {favorites.map((room) => (
                            <li key={room.id} className="favorite-item">
                                <span className="room-name">
                                    {room.building_name}, {room.floor}
                                </span>
                                <div className="room-status">
                                    <span
                                        className="status-dot"
                                        style={{ backgroundColor: getStatusColor(room.status) }}
                                    ></span>
                                    <span className="room-number2">{room.number}</span>
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
                        ))}
                    </ul>
                </div>
            </main>
        </div>
    );
};

export default Favorites;

