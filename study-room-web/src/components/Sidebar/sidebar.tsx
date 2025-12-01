import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "./sidebar.css";
import BCRFLogo from "../../assets/logo.png";
import { authAPI } from "../../utils/api";

const Sidebar: React.FC = () => {
  const handleLogout = () => {
    authAPI.logout();
    window.location.href = "/login"; // force redirect
  };

  const location = useLocation();

  if (location.pathname === "/login") {
    return null;
  }

  return (
    <div className="sidebar">
      <div className="logo">
        <img src={BCRFLogo} alt="Bobcat Room Finder" />
      </div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/find-room">Find a Room</Link>
        <Link to="/campus-map">Campus Map</Link>
        <Link to="/favorites">Favorites</Link>
        <Link to="/preferences">Preferences</Link>
      </nav>
      <button onClick={handleLogout} className="logout-button">
        Log Out
      </button>
    </div>
  );
};

export default Sidebar;
