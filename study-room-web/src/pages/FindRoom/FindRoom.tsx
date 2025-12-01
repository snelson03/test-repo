import React, { useEffect, useRef, useState } from "react";
import { IoHeart, IoHeartOutline } from "react-icons/io5";
import { IoChevronDown } from "react-icons/io5";
import Sidebar from "../../components/Sidebar/sidebar";
import "./findroom.css";
import "./roomdetailsmodal.css";
import { AiOutlineCheck } from "react-icons/ai";
import { FaRegEdit } from "react-icons/fa";
import { buildingsAPI, usersAPI } from "../../utils/api";
import type { Building, Room as APIRoom } from "../../utils/api";

type RoomStatus = "available" | "occupied" | "offline";

interface Room {
  id: number;
  number: string;
  floor: number | null;
  status: RoomStatus;
  buildingId: number;
  buildingName: string;
}

interface RoomDetails {
  building: string;
  floor: string;
  number: string;
  status: RoomStatus;
  restrictions?: string;
}

function convertFloorToOrdinal(floor: string): string {
  const num = parseInt(floor);
  if (isNaN(num)) return floor;

  const suffix =
    num % 10 === 1 && num % 100 !== 11
      ? "st"
      : num % 10 === 2 && num % 100 !== 12
        ? "nd"
        : num % 10 === 3 && num % 100 !== 13
          ? "rd"
          : "th";

  return `${num}${suffix} Floor`;
}

function getBuildingAddress(building: string): string {
  const addresses: Record<string, string> = {
    "Stocker Center": "28 West Green Dr., Athens, OH 45701",
    "Academic & Research Center": "61 Oxbow Trail, Athens, OH 45701",
    "Alden Library": "30 Park Pl, Athens, OH 45701",
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
            <p className="restrictions-line">{room.restrictions ?? "None"}</p>
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

// Convert API room status to UI status
const getRoomStatus = (isAvailable: boolean): RoomStatus => {
  return isAvailable ? "available" : "occupied";
};

const FindRoom: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [favorites, setFavorites] = useState<APIRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null
  );
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomDetails | null>(null);
  const [showRoomModal, setShowRoomModal] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleClick = () => {
    setEditing(!editing);
  };

  // Load buildings and all rooms
  useEffect(() => {
    const loadData = async () => {
      try {
        const [buildingsData, favoritesData] = await Promise.all([
          buildingsAPI.getAll(),
          usersAPI.getFavorites(),
        ]);

        setBuildings(buildingsData);
        setFavorites(favoritesData);

        // Load rooms for all buildings so dropdown can show all floors
        const allRoomsPromises = buildingsData.map((building) =>
          buildingsAPI.getRooms(building.id).then((buildingRooms) =>
            buildingRooms.map((room) => ({
              id: room.id,
              number: room.room_number,
              floor: room.floor_number,
              status: getRoomStatus(room.is_available),
              buildingId: room.building_id,
              buildingName: building.name,
            }))
          )
        );

        const allRoomsArrays = await Promise.all(allRoomsPromises);
        const allRooms = allRoomsArrays.flat();
        setRooms(allRooms);

        if (buildingsData.length > 0) {
          setSelectedBuilding(buildingsData[0]);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Set default floor when building changes
  useEffect(() => {
    if (!selectedBuilding) return;

    // Get floors for the selected building from already loaded rooms
    const buildingRooms = rooms.filter(
      (r) => r.buildingId === selectedBuilding.id
    );

    // Set default floor if not set or if current floor doesn't exist for this building
    if (buildingRooms.length > 0) {
      const floors = [
        ...new Set(buildingRooms.map((r) => r.floor).filter((f) => f !== null)),
      ] as number[];

      if (floors.length > 0) {
        // If current selected floor doesn't exist for this building, or no floor is selected
        if (selectedFloor === null || !floors.includes(selectedFloor)) {
          setSelectedFloor(floors[0]);
        }
      }
    }
  }, [selectedBuilding, rooms]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isFavorite = (room: Room) => {
    return favorites.some((f) => f.id === room.id);
  };

  const toggleFavorite = async (room: Room) => {
    const isFav = isFavorite(room);

    try {
      if (isFav) {
        await usersAPI.removeFavorite(room.id);
      } else {
        await usersAPI.addFavorite(room.id);
      }

      // Reload favorites
      const updatedFavorites = await usersAPI.getFavorites();
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error("Failed to update favorite:", error);
    }
  };

  // Get rooms for selected building and floor
  const roomsForSelected = rooms.filter(
    (r) => r.buildingId === selectedBuilding?.id && r.floor === selectedFloor
  );

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
              <IoChevronDown /> {selectedBuilding?.name || "Select Building"}
            </button>

            <button
              className={`edit-favorites-btn ${editing ? "done-btn" : ""}`}
              onClick={handleClick}
              style={{
                backgroundColor: editing ? "#b5f5d0ff" : "white",
                color: editing ? "#024230" : "#024230",
                border: editing ? "2px solid #024230" : "2px solid #024230",
              }}
            >
              {editing ? (
                <AiOutlineCheck
                  size={20}
                  style={{
                    marginRight: "2px",
                    marginTop: "-5px",
                    position: "relative",
                    top: "3px",
                  }}
                />
              ) : (
                <FaRegEdit
                  size={20}
                  style={{
                    marginRight: "2px",
                    marginTop: "-5px",
                    position: "relative",
                    top: "3px",
                  }}
                />
              )}
              {editing ? "Done" : "Edit Favorites"}
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu" role="menu">
                {buildings.map((bld) => {
                  const buildingFloors = [
                    ...new Set(
                      rooms
                        .filter((r) => r.buildingId === bld.id)
                        .map((r) => r.floor)
                        .filter((f) => f !== null)
                    ),
                  ] as number[];
                  return (
                    <div key={bld.id} className="dropdown-building">
                      <div className="dropdown-building-name">{bld.name}</div>
                      <div className="dropdown-floors">
                        {buildingFloors.map((floor) => (
                          <button
                            key={floor}
                            className={`dropdown-item ${bld.id === selectedBuilding?.id && floor === selectedFloor ? "active" : ""}`}
                            onClick={() => {
                              setSelectedBuilding(bld);
                              setSelectedFloor(floor);
                              setDropdownOpen(false);
                            }}
                          >
                            {floor}F
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <section className="room-grid" aria-live="polite">
          {loading ? (
            <div>Loading rooms...</div>
          ) : roomsForSelected.length === 0 ? (
            <div>No rooms found for this floor</div>
          ) : (
            roomsForSelected.map((room) => (
              <div
                key={room.id}
                className={`room ${room.status}`}
                onClick={() => {
                  if (!editing) {
                    setSelectedRoom({
                      building: room.buildingName,
                      floor: `${room.floor}F`,
                      number: room.number,
                      status: room.status,
                      restrictions: undefined,
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
            ))
          )}
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
