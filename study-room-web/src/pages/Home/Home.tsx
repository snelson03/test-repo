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
            <div className="summary-item">
              <span className="building">Stocker Center</span>
              <span className="rm_status">All rooms full</span>
            </div>

            <div className="summary-item">
              <span className="building">ARC</span>
              <span className="rm_status">2 rooms free</span>
            </div>

            <div className="summary-item">
              <span className="building">Alden Library</span>
              <span className="rm_status">5 rooms free</span>
            </div>

          </div>
        </section>

        <section className="favorites-map-container">

          <section className="favorites-rooms">
            <div className="favorites">
              <div className="favorites-bar">
                <span>Favorites</span>
              </div>
              <ul>
                <li>Stocker Center 155</li>
                <li>Stocker Center 152</li>
              </ul>
            </div>
          </section>
        
          <section className="map-section">
            <div className="map">
              <img src={MapPlaceholder} alt="Campus Map" />
            </div>
          </section>

        </section>

      </main>
    </div>
  );
};

export default Home;
