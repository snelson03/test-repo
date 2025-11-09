import React from 'react';
import Sidebar from "../../components/Sidebar/sidebar";
import './favorites.css';

interface FavoriteRoom {
    id: number;
    building_name: string;
    floor: string;
    status: "available" | "busy" | "offline";
    number: number;
}

const favorites: FavoriteRoom[] = [
    { id: 1, building_name: "Stocker Center", floor: "1F", status: "available", number: 155 },
    { id: 2, building_name: "Stocker Center", floor: "2F", status: "offline", number: 212 },
    { id: 3, building_name: "Stocker Center", floor: "3F", status: "busy", number: 315 },
    { id: 4, building_name: "Academic & Research Center", floor: "1F", status: "available", number: 103 },
    { id: 5, building_name: "Academic & Research Center", floor: "2F", status: "busy", number: 207 },
    { id: 6, building_name: "Alden Library", floor: "1F", status: "available", number: 121 },
];

const Favorites: React.FC = () => {
    const getStatusColor = (status: FavoriteRoom["status"]) => {
        switch (status) {
            case "available":
                return "#2EB159";
            case "busy":
                return "#CA2E2E";
            case "offline":
                return "#9E9E9E";
        }
    };

    return (
        <div className="favorites-page">
            <Sidebar />

            <main className="favorites-container">
                <div className="favorites-header">
                    <h2>Favorites</h2>
                </div>

                <div className="favorites-list-wrapper">
                    <button className="edit-btn">Edit</button>


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
                                    <span className="room-number">{room.number}</span>
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

