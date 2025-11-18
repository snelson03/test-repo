import React from 'react';
import Sidebar from "../../components/Sidebar/sidebar";
import './home.css';
import Map from "../../assets/map.jpeg";

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <Sidebar />
      <main className="home-content">
        <h1 className="welcome-text">Welcome back, sn280121!</h1>

        <section className="summary">
          <div className="summary-bar">
            <div className="summary-item">
              <span className="building">Stocker Center</span>
              <div className="rm_status">
                <span className="status-dot red"></span>
                All rooms full
              </div>
            </div>

            <div className="summary-item">
              <span className="building">Academic & Research Center</span>
              <div className="rm_status">
                <span className="status-dot yellow"></span>
                2 rooms free
              </div>
            </div>

            <div className="summary-item">
              <span className="building">Alden Library</span>
              <div className="rm_status">
                <span className="status-dot green"></span>
                5 rooms free
              </div>
            </div>

            <button className="see-rooms-btn">
              See All Rooms →
            </button>

          </div>
        </section>

        <section className="favorites-map-container">

          <section className="favorites-rooms">
            <div className="favorites">
              <div className="favorites-bar">Favorites</div>
              <ul className="favorites-list">
                <li className="occupied">Academic & Research Center 155</li>
                <li className="offline">Academic & Research Center 161</li>
                <li className="available">Alden Library 216</li>
                <li className="offline">Alden Library 312</li>
                <li className="available">Stocker Center 155</li>
                <li className="available">Stocker Center 152</li>
              </ul>
            </div>
          </section>
        
          <section className="map-section">
            <div className="map">
              <img src={Map} alt="Campus Map" />
            </div>
          </section>

        </section>

      </main>
    </div>
  );
};

export default Home;
