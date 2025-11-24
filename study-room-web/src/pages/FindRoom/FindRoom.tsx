import React, { useEffect, useRef, useState } from 'react';
import { IoHeart, IoHeartOutline } from "react-icons/io5";
import { IoChevronDown } from "react-icons/io5";
import Sidebar from "../../components/Sidebar/sidebar";
import './findroom.css';
import './roomdetailsmodal.css';
import { AiOutlineCheck } from "react-icons/ai";
import { FaRegEdit, FaCheck } from "react-icons/fa";

type RoomStatus = "available" | "occupied" | "offline";
type Room = { number: number; status: RoomStatus };

interface RoomDetails {
    building: string;
    floor: string;
    number: number;
    status: RoomStatus;
    restrictions?: string;
}

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

function convertFloorToOrdinal(floor: string): string {
    const num = parseInt(floor);
    if (isNaN(num)) return floor;

    const suffix =
        num % 10 === 1 && num % 100 !== 11 ? "st" :
        num % 10 === 2 && num % 100 !== 12 ? "nd" :
        num % 10 === 3 && num % 100 !== 13 ? "rd" :
        "th";

    return `${num}${suffix} Floor`;
}

function getBuildingAddress(building: string): string {
    const addresses: Record<string, string> = {
        "Stocker Center": "28 West Green Dr., Athens, OH 45701",
        "Academic & Research Center": "61 Oxbow Trail, Athens, OH 45701",
        "Alden Library": "30 Park Pl, Athens, OH 45701"
    };

    return addresses[building] ?? "Address not available";
}


const RoomDetailsModal: React.FC<{
    room: RoomDetails | null;
    onClose: () => void;
}> = ({ room, onClose }) => {
    if (!room) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>

                <h2 className="modal-title">Room Details</h2>

                <div className="modal-top-bar">
                    <span className="modal-building">{room.building}</span>

                    <span className="modal-room-status">
                        <span className={`status-dot ${room.status}`}></span>
                        {room.number}
                    </span>
                </div>

                <div className="modal-location-section">

                    <div className="location-lines">
                        <h3 className="location-title">Location</h3>
                        <p className="location-line">
                            {room.building}, {convertFloorToOrdinal(room.floor)}
                        </p>
                        <p className="location-line-address">
                            {getBuildingAddress(room.building)}
                        </p>
                    </div>
                </div>

                <div className="modal-restrictions-section">
                    <div className="restrictions-box">
                        <h3 className="restrictions-title">Restrictions</h3>
                        <p className="restrictions-line">
                            {room.restrictions ?? "None"}
                        </p>
                    </div>
                </div>

                <div className={`modal-status-bar ${room.status}`}>
                    {room.status === "available" && "AVAILABLE NOW"}
                    {room.status === "occupied" && "OCCUPIED"}
                    {room.status === "offline" && "OFFLINE"}
                </div>

                <button
                    className="view-map-btn"
                    onClick={() => {
                        onClose();
                        window.location.href = `/campus-map?building=${encodeURIComponent(room.building)}`;
                    }}
                >
                    View on Map
                </button>


                <button className="close-modal-btn" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};

const FindRoom: React.FC = () => {
    const[dropdownOpen, setDropdownOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const buildings = Object.keys(buildingData);
    const defaultBuilding = buildings[0];
    const defaultFloor = Object.keys(buildingData[defaultBuilding])[0];

    const [selectedBuilding, setSelectedBuilding] = useState<string>(defaultBuilding);
    const [selectedFloor, setSelectedFloor] = useState<string>(defaultFloor);
    const [favorites, setFavorites] = useState<any[]>([]);

    const [selectedRoom, setSelectedRoom] = useState<RoomDetails | null>(null);
    const [showRoomModal, setShowRoomModal] = useState(false);


    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const handleClick = () => {
        setEditing(!editing);
    };

    

    useEffect(() => {
        const raw = localStorage.getItem("favorites");

        if (raw === null) {
            const mock: any[] = [];
            localStorage.setItem("favorites", JSON.stringify(mock));
            setFavorites(mock);
        } else {
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

    const toggleFavorite = (room: Room) => {
        const exists = favorites.some(
            f =>
                f.number === room.number &&
                f.floor === selectedFloor &&
                f.building_name === selectedBuilding
        );

        let updated;
        if (exists) {
            updated = favorites.filter(
                f =>
                    !(
                        f.number === room.number &&
                        f.floor === selectedFloor &&
                        f.building_name === selectedBuilding
                    )
            );
        } else {
            const newFavorite = {
                id: Date.now(),
                building_name: selectedBuilding,
                floor: selectedFloor,
                status: room.status,
                number: room.number,
            };
            updated = [...favorites, newFavorite];
        }

        setFavorites(updated);
        localStorage.setItem("favorites", JSON.stringify(updated));

        const session = JSON.parse(localStorage.getItem("mock_user_session") || "{}");
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const userIndex = users.findIndex((u: any) => u.email === session.email);
        
        if (userIndex !== -1) {
            users[userIndex].favorites = updated;
            localStorage.setItem("users", JSON.stringify(users));
        }
    };

    const roomsForSelected = buildingData[selectedBuilding][selectedFloor] ?? [];


  return (
    <div className="find-room-container">
      <Sidebar />
      <main className="find-room-content">
        <h1 className="find-room-header">Find a Room</h1>

        <div className="top-actions">
            <div className="building-floor-selector" ref={dropdownRef}>
                <button
                    className="building-floor-btn"
                    onClick={() => setDropdownOpen((s) => !s)}
                    arias-haspopup="menu"
                    aria-expanded={dropdownOpen}
                >
                    <IoChevronDown /> {selectedBuilding}
                </button>

            <button
                className={`edit-favorites-btn ${editing ? "done-btn" : ""}`}
                onClick={handleClick}
                style={{
                    backgroundColor: editing ? "#b5f5d0ff" : "white", 
                    color: editing ? "#024230" : "#024230",          
                    border: editing ? "2px solid #024230" : "2px solid #024230"
                }}
                >
                {editing ? (
                    <AiOutlineCheck
                    size={20}
                    style={{ marginRight: "2px", marginTop: "-5px", position: "relative", top: "3px" }}
                    />
                ) : (
                    <FaRegEdit
                    size={20}
                    style={{ marginRight: "2px", marginTop: "-5px", position: "relative", top: "3px" }}
                    />
                )}
                {editing ? "Done" : "Edit Favorites"}
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
    </div>

                <section className="room-grid" aria-live="polite">
                    {roomsForSelected.map((room) => (
                        <div
                            key={room.number}
                            className={`room ${room.status}`}
                            onClick={() => {
                                if (!editing) {
                                    let restrictions = undefined;

                                    if (room.number === 152) {
                                        restrictions = "Computer Science Students";
                                    }
                                    setSelectedRoom({
                                        building: selectedBuilding,
                                        floor: selectedFloor,
                                        number: room.number,
                                        status: room.status,
                                        restrictions
                                    });
                                    setShowRoomModal(true);
                                }
                            }}
                        >
                            {editing && (
                                <button
                                    className="favorite-heart"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(room);
                                    }}
                                >
                                    {isFavorite(room) ? (
                                        <IoHeart size={32} color="white" />
                                    ) : (
                                        <IoHeartOutline size={32} color="white" />
                                    )}
                                </button>
                            )}

                            <span className="room-number">{room.number}</span>
                        </div>
                    ))}
                </section>
                {showRoomModal && (
                    <RoomDetailsModal
                        room={selectedRoom}
                        onClose={() => setShowRoomModal(false)}
                    />
                )}

            </main>
        </div>
    );
};

export default FindRoom;
