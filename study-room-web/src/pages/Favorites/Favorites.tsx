import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/sidebar";
import './favorites.css';

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
        const raw = localStorage.getItem("favorites");

        if (!raw) {
            // First time: load defaults
            localStorage.setItem("favorites", JSON.stringify(defaultFavorites));
            setFavorites(defaultFavorites);
            return;
        }

        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                setFavorites(parsed);
            } else {
                setFavorites(defaultFavorites);
            }
        } catch {
            setFavorites(defaultFavorites);
        }
    }, []);

    // Simulate status changes every 5 seconds
    useEffect(() => {
        if (favorites.length === 0) return;

        const interval = setInterval(() => {
            setFavorites(prev => {
                const updated = prev.map(room => ({
                    ...room,
                    status: ["available", "busy", "offline"][Math.floor(Math.random() * 3)] as any
                }));
                localStorage.setItem("favorites", JSON.stringify(updated));
                return updated;
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [favorites.length]);

    // Remove favorite & update localStorage
    const removeFavorite = (id: number) => {
        setFavorites(prev => {
            const updated = prev.filter(room => room.id !== id);
            localStorage.setItem("favorites", JSON.stringify(updated));
            return updated;
        });
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
                                            ✕
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

