import React from 'react';
import Sidebar from "../../components/Sidebar/sidebar";
import './home.css';
import MapPlaceholder from "../../assets/map-placeholder.png";

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <Sidebar />
      <main className="home-content">
        <h1>Welcome back, sn280121!</h1>

        <section className="summary">
          <div className="summary-bar">
            <span>Stocker Center — All rooms full</span>
            <span>ARC — 2 rooms free</span>
            <span>Alden Library — 5 rooms free</span>
          </div>
        </section>

        <section className="favorites-rooms">
          <div className="favorites">
            <h2>Favorites</h2>
            <ul>
              <li>Stocker Center 155</li>
              <li>Stocker Center 152</li>
            </ul>
          </div>
        

          <div className="map">
            <h2>Campus Map</h2>
            <img src={MapPlaceholder} alt="Campus Map" />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
