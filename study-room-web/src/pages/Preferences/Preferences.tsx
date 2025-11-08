// import React, { useState } from 'react';
import React from "react";
import Sidebar from "../../components/Sidebar/sidebar";
import './preferences.css';

const Preferences: React.FC = () => {
// const[dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="preferences-container">
        <Sidebar />
        <main className="preferences-content">
            <h1 className="preferences-header">Preferences</h1>

                <div className="option-box">
                    <h2 className="option-heading">Notifications</h2>

                    <div className="option-section">
                        <h3 className="option-subheading">Notification Types</h3>

                        <div className="option-item">
                            <input type="checkbox" /> 
                            <span>All Available Rooms</span>
                        </div>
                        <div className="option-item">
                            <input type="checkbox" />
                            <span>Favorites Only{" "}</span>
                            <span className="option-edit">Edit</span>
                        </div>
                        <div className="option-item">
                            <input type="checkbox" />
                            <span>Building Specific{" "}</span>
                            <span className="option-edit">Edit</span>
                        </div>
                    </div>

                    <div className="option-section">
                        <h3 className="option-subheading">Notification Methods</h3>

                        <div className="option-item">
                            <input type="checkbox" />
                            <span>Email</span>
                        </div>
                        <div className="option-item">
                            <input type="checkbox" />
                            <span>Sms</span>
                        </div>
                    </div>

                    <div className="option-section">
                        <h3 className="option-subheading">Notification Scheduling</h3>

                        <div className="option-item">
                            <input type="checkbox" />
                            <span>9:00AM - 9:00PM</span>
                        </div>
                        <div className="option-item">
                            <input type="checkbox" />
                            <span>Always On</span>
                        </div>
                        <div className="option-item">
                            <input type="checkbox" />
                            <span>Custom{" "}</span>
                            <span className="option-edit">Edit</span>
                        </div>
                    </div>
                </div>
        </main>
    </div>
  );
};

export default Preferences;
