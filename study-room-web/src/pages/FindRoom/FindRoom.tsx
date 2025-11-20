import React, { useEffect, useRef, useState } from 'react';
import { IoHeart, IoHeartOutline } from "react-icons/io5";
import Sidebar from "../../components/Sidebar/sidebar";
import './findroom.css';

type RoomStatus = "available" | "occupied" | "offline";
type Room = { number: number; status: RoomStatus };

const genRooms = (start: number, count: number): Room[] => {
    const statuses: RoomStatus[] = ["available", "occupied", "offline"];
    return Array.from({ length: count }).map((_, i) => ({
        number: start + i,
        status: statuses[i % statuses.length],
    }));
};

const buildingData: Record<string, Record<string, Room[]>> = {
    "Stocker Center": {
        "1F": genRooms(151, 8),
        "2F": genRooms(201, 8),
        "3F": genRooms(301, 8),
    },
    "Academic & Research Center": {
        "1F": genRooms(101, 8),
        "2F": genRooms(201, 8),
        "3F": genRooms(301, 8),
    },
    "Alden Library": {
        "1F": genRooms(120, 8),
        "2F": genRooms(220, 8),
        "3F": genRooms(320, 8),
        "4F": genRooms(420, 8),
        "5F": genRooms(520, 8),
        "6F": genRooms(620, 8),
        "7F": genRooms(720, 8),
    },
};

const FindRoom: React.FC = () => {
    const[dropdownOpen, setDropdownOpen] = useState(false);

    const buildings = Object.keys(buildingData);
    const defaultBuilding = buildings[0];
    const defaultFloor = Object.keys(buildingData[defaultBuilding])[0];

    const [selectedBuilding, setSelectedBuilding] = useState<string>(defaultBuilding);
    const [selectedFloor, setSelectedFloor] = useState<string>(defaultFloor);
    const [favorites, setFavorites] = useState<any[]>([]);

    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem("favorites");

        if (raw === null) {
            // Only create mock favorites the FIRST time ever
            const mock: any[] = [];
            localStorage.setItem("favorites", JSON.stringify(mock));
            setFavorites(mock);
        } else {
            // Use whatever is in storage (even empty array)
            setFavorites(JSON.parse(raw));
        }
    }, []);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isFavorite = (room: Room) => {
        return favorites.some(
            (f: any) =>
                f.number === room.number &&
                f.floor === selectedFloor &&
                f.building_name === selectedBuilding
        );
    };

    // const addToFavorites = (room: Room) => {
    //     const exists = favorites.some(
    //         f =>
    //             f.number === room.number &&
    //             f.floor === selectedFloor &&
    //             f.building_name === selectedBuilding
    //     );

    //     if (exists) return;

    //     const newFavorite = {
    //         id: Date.now(),
    //         building_name: selectedBuilding,
    //         floor: selectedFloor,
    //         status: room.status,
    //         number: room.number,
    //     };

    //     const updated = [...favorites, newFavorite];
    //     localStorage.setItem("favorites", JSON.stringify(updated));
    //     setFavorites(updated);
    // };


    const toggleFavorite = (room: Room) => {
        const exists = favorites.some(
            f =>
                f.number === room.number &&
                f.floor === selectedFloor &&
                f.building_name === selectedBuilding
        );

        let updated;

        if (exists) {
            // REMOVE
            updated = favorites.filter(
                f =>
                    !(
                        f.number === room.number &&
                        f.floor === selectedFloor &&
                        f.building_name === selectedBuilding
                    )
            );
        } else {
            // ADD
            const newFavorite = {
                id: Date.now(),
                building_name: selectedBuilding,
                floor: selectedFloor,
                status: room.status,
                number: room.number,
            };
            updated = [...favorites, newFavorite];
        }

        localStorage.setItem("favorites", JSON.stringify(updated));
        setFavorites(updated);
    };

    const removeFromFavorites = (room: Room) => {
        const updated = favorites.filter(
            f =>
                !(
                    f.number === room.number &&
                    f.floor === selectedFloor &&
                    f.building_name === selectedBuilding
                )
        );

        localStorage.setItem("favorites", JSON.stringify(updated));
        setFavorites(updated);
    };

    // const floorsForSelected = Object.keys(buildingData[selectedBuilding]);
    const roomsForSelected = buildingData[selectedBuilding][selectedFloor] ?? [];


  return (
    <div className="find-room-container">
      <Sidebar />
      <main className="find-room-content">
        <h1 className="find-room-header">Find a Room</h1>

        <div className="building-floor-selector" ref={dropdownRef}>
            <button
                className="building-floor-btn"
                onClick={() => setDropdownOpen((s) => !s)}
                arias-haspopup="menu"
                aria-expanded={dropdownOpen}
            >
                ☰ {selectedBuilding}, {selectedFloor}
            </button>

            {dropdownOpen && (
                <div className="dropdown-menu" role="menu">
                {buildings.map((bld) => (
                    <div key={bld} className="dropdown-building">
                        <div className="dropdown-building-name">{bld}</div>
                        <div className="dropdown-floors">
                            {Object.keys(buildingData[bld]).map((floor) => (
                                <button
                                    key={floor}
                                    className={`dropdown-item ${bld === selectedBuilding && floor === selectedFloor ? "active" : ""}`}
                                    onClick={() => {
                                        setSelectedBuilding(bld);
                                        setSelectedFloor(floor);
                                        setDropdownOpen(false);
                                    }}
                                >
                                    {floor}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>

                <section className="room-grid" aria-live="polite">
                    {roomsForSelected.map((room) => (
                        <div key={room.number} className={`room ${room.status}`}>

                            <button
                                className="favorite-heart"
                                onClick={() => toggleFavorite(room)}
                            >
                                {isFavorite(room) ? (
                                    <IoHeart size={32} color="white" />
                                ) : (
                                    <IoHeartOutline size={32} color="white" />
                                )}
                            </button>

                            <span className="room-number">{room.number}</span>
                        </div>
                    ))}
                </section>
            </main>
        </div>
    );
};

export default FindRoom;
