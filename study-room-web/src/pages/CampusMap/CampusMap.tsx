import React from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Sidebar from "../../components/Sidebar/sidebar";
import './campusmap.css';
import Map from "../../assets/map.jpeg";
import Arc from "../../assets/arc.png";
import Stocker from "../../assets/stocker.png";
import Alden from "../../assets/alden.png";

const CampusMap: React.FC = () => {
  return (
    <div className="map-container">
      <Sidebar />
      <main className="map-content">
        <h1 className="header">Campus Map</h1>

        <section className="map-section">
            <div className="map-with-key">
                <div className="map">
                    <TransformWrapper
                        initialScale={1.0}
                        minScale={1}
                        maxScale={6}
                        wheel={{ step: 0.2 }}
                        pinch={{ step: 0.5 }}

                        limitToBounds={true}
                        centerOnInit={true}
                        alignmentAnimation={{ sizeX: 1, sizeY: 1 }}
                    >
                        <TransformComponent>
                            <img src={Map} alt="Campus Map" />
                        </TransformComponent>
                    </TransformWrapper>
                </div>

                <div className="building-key-container">
                    <div className="participating-buildings">
                        <div className="buildings">
                            <div className="key-bar">Available Buildings</div>
                            <ul className="buildings-list">
                                <li className="arc">
                                    Academic & Research Center
                                    <ul className="address-list">
                                        <li className="arc-address">61 Oxbow Trail, Athens, OH 45701</li>
                                    </ul>
                                    <div className="arc-pic">
                                        <img src={Arc} alt="ARC" />
                                    </div>
                                </li>

                                <li className="stocker">
                                    Stocker Center
                                    <ul className="address-list">
                                        <li className="stocker-address">28 West Green Dr., Athens, OH 45701</li>
                                    </ul>
                                    <div className="stocker-pic">
                                        <img src={Stocker} alt="Stocker Center" />
                                    </div>
                                </li>

                                <li className="alden">
                                    Alden Library
                                    <ul className="address-list">
                                        <li className="alden-address">30 Park Pl, Athens, OH 45701</li>
                                    </ul>
                                    <div className="alden-pic">
                                        <img src={Alden} alt="Alden Library" />
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>

      </main>
    </div>
  );
};

export default CampusMap;

