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
                        <label className="option-item">
                            <input type="checkbox" /> All Available Rooms
                        </label>
                        <label className="option-item">
                            <input type="checkbox" /> Favorites Only{" "}
                            <span className="option-edit">Edit</span>
                        </label>
                        <label className="option-item">
                            <input type="checkbox" /> Building Specific{" "}
                            <span className="option-edit">Edit</span>
                        </label>
                    </div>

                    <div className="option-section">
                        <h3 className="option-subheading">Notification Methods</h3>
                        <label className="option-item">
                            <input type="checkbox" /> Email
                        </label>
                        <label className="option-item">
                            <input type="checkbox" /> Sms
                        </label>
                    </div>

                    <div className="option-section">
                        <h3 className="option-subheading">Notification Scheduling</h3>
                        <label className="option-item">
                            <input type="checkbox" /> 9:00AM - 9:00PM
                        </label>
                        <label className="option-item">
                            <input type="checkbox" /> Always On
                        </label>
                        <label className="option-item">
                            <input type="checkbox" /> Custom{" "}
                            <span className="option-edit">Edit</span>
                        </label>
                    </div>
                </div>
        </main>
    </div>
  );
};

export default Preferences;
