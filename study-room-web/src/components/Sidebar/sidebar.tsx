import React from 'react';
import { Link } from 'react-router-dom';
import './sidebar.css';
import BCRFLogo from "../../assets/logo.png";

const Sidebar: React.FC = () => {
    return (
        <div className="sidebar">
            <div className="logo">
                <img src={BCRFLogo} alt="Bobcat Room Finder" />
                {/* <h2>Bobcat Room Finder</h2> */}
            </div>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/find-room">Find a Room</Link>
                <Link to="/campus-map">Campus Map</Link>
                <Link to="/favorites">Favorites</Link>
                <Link to="/preferences">Preferences</Link>
            </nav>
        </div>
    );
};

export default Sidebar;