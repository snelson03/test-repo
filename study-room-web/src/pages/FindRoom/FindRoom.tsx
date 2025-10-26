import React, { useState } from 'react';
import Sidebar from "../../components/Sidebar/sidebar";
import './findroom.css';

const FindRoom: React.FC = () => {
    const[dropdownOpen, setDropdownOpen] = useState(false);

    const rooms = [
        { number: 151, status: "occupied"},
        { number: 152, status: "available"},
        { number: 153, status: "available"},
        { number: 154, status: "offline"},
        { number: 155, status: "available"},
        { number: 156, status: "occupied"},
        { number: 157, status: "available"},
        { number: 158, status: "available"},
    ]
  return (
    <div className="find-room-container">
      <Sidebar />
      <main className="find-room-content">
        <h1 className="find-room-header">Find a Room</h1>

        <div className="building-floor-selector">
            <button
                className="building-floor-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
            >
                ☰ Stocker Center, 1F
            </button>

            {dropdownOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-item">Stocker Center, 1F</div>
                    <div className="dropdown-item">Stocker Center, 2F</div>
                    <div className="dropdown-item">Stocker Center, 3F</div>
                    <div className="dropdown-item">Academic & Research Center, 1F</div>
                    <div className="dropdown-item">Academic & Research Center, 2F</div>
                    <div className="dropdown-item">Academic & Research Center, 3F</div>
                    <div className="dropdown-item">Alden Library, 1F</div>
                    <div className="dropdown-item">Alden Library, 2F</div>
                    <div className="dropdown-item">Alden Library, 3F</div>
                    <div className="dropdown-item">Alden Library, 4F</div>
                    <div className="dropdown-item">Alden Library, 5F</div>
                    <div className="dropdown-item">Alden Library, 6F</div>
                    <div className="dropdown-item">Alden Library, 7F</div>
                </div>
            )}
        </div>

        <section className="room-grid">
            {rooms.map((room) => (
                <div key={room.number} className={`room ${room.status}`}>
                    <span className="room-number">{room.number}</span>
                </div>
            ))}
            </section>
      </main>
    </div>
  );
};

export default FindRoom;
