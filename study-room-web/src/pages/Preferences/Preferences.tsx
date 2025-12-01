import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/sidebar";
import { IoChevronDown } from "react-icons/io5";
import "./preferences.css";
import { usersAPI } from "../../utils/api";

interface UserPreferences {
  notifyAllRooms: boolean;
  notifyFavorites: boolean;
  notifyBuildings: boolean;

  methodEmail: boolean;
  methodSms: boolean;

  scheduleDaytime: boolean;
  scheduleAlways: boolean;
  scheduleCustom: boolean;
}

const defaultPrefs: UserPreferences = {
  notifyAllRooms: false,
  notifyFavorites: false,
  notifyBuildings: false,

  methodEmail: false,
  methodSms: false,

  scheduleDaytime: false,
  scheduleAlways: false,
  scheduleCustom: false,
};

const Preferences: React.FC = () => {
  const [prefs, setPrefs] = useState<UserPreferences>(defaultPrefs);

  const [userInfo, setUserInfo] = useState({
    email: "",
    firstName: "",
    phone: "",
  });

  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");

  const [loaded, setLoaded] = useState(false);
  const [sectionDropdownOpen, setSectionDropdownOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("Notifications");

  useEffect(() => {
    const raw = localStorage.getItem("userPreferences");
    if (raw) {
      try {
        setPrefs({ ...defaultPrefs, ...JSON.parse(raw) });
      } catch {
        setPrefs(defaultPrefs);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("userPreferences", JSON.stringify(prefs));
    }
  }, [prefs, loaded]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await usersAPI.getCurrentUser();
        setUserInfo({
          email: user.email,
          firstName: user.full_name?.split(" ")[0] || "",
          phone: "", // Phone not in backend model
        });
        setFirstName(user.full_name?.split(" ")[0] || "");
        setPhone(""); // Phone not in backend model
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    };

    loadUserData();
  }, []);

  const update = (key: keyof UserPreferences) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const saveAccountChanges = async () => {
    try {
      await usersAPI.updateCurrentUser({ full_name: firstName });
      setUserInfo({ ...userInfo, firstName });
      alert("Account updated successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to update account. Please try again.");
    }
  };

  return (
    <div className="preferences-container">
      <Sidebar />
      <main className="preferences-content">
        <h1 className="preferences-header">Preferences</h1>

        <div className="preferences-top-actions">
          <button
            className="preferences-dropdown-btn"
            onClick={() => setSectionDropdownOpen((prev) => !prev)}
          >
            <IoChevronDown /> {selectedSection}
          </button>

          {sectionDropdownOpen && (
            <div className="preferences-dropdown-menu">
              {["Notifications", "Account"].map((sec) => (
                <button
                  key={sec}
                  className="preferences-dropdown-item"
                  onClick={() => {
                    setSelectedSection(sec);
                    setSectionDropdownOpen(false);
                  }}
                >
                  {sec}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="option-box">
          {selectedSection === "Notifications" && (
            <>
              <h2 className="option-heading">Notifications</h2>

              <div className="option-section">
                <h3 className="option-subheading">Notification Types</h3>

                <div className="option-item">
                  <input
                    type="checkbox"
                    checked={prefs.notifyAllRooms}
                    onChange={() => update("notifyAllRooms")}
                  />
                  <span>All Available Rooms</span>
                </div>

                <div className="option-item">
                  <input
                    type="checkbox"
                    checked={prefs.notifyFavorites}
                    onChange={() => update("notifyFavorites")}
                  />
                  <span>Favorites Only </span>
                  <span className="option-edit">Edit</span>
                </div>

                <div className="option-item">
                  <input
                    type="checkbox"
                    checked={prefs.notifyBuildings}
                    onChange={() => update("notifyBuildings")}
                  />
                  <span>Building Specific </span>
                  <span className="option-edit">Edit</span>
                </div>
              </div>

              <div className="option-section">
                <h3 className="option-subheading">Notification Methods</h3>

                <div className="option-item">
                  <input
                    type="checkbox"
                    checked={prefs.methodEmail}
                    onChange={() => update("methodEmail")}
                  />
                  <span>Email</span>
                </div>

                <div className="option-item">
                  <input
                    type="checkbox"
                    checked={prefs.methodSms}
                    onChange={() => update("methodSms")}
                  />
                  <span>Sms</span>
                </div>
              </div>

              <div className="option-section">
                <h3 className="option-subheading">Notification Scheduling</h3>

                <div className="option-item">
                  <input
                    type="checkbox"
                    checked={prefs.scheduleDaytime}
                    onChange={() => update("scheduleDaytime")}
                  />
                  <span>9:00AM - 9:00PM</span>
                </div>

                <div className="option-item">
                  <input
                    type="checkbox"
                    checked={prefs.scheduleAlways}
                    onChange={() => update("scheduleAlways")}
                  />
                  <span>Always On</span>
                </div>

                <div className="option-item">
                  <input
                    type="checkbox"
                    checked={prefs.scheduleCustom}
                    onChange={() => update("scheduleCustom")}
                  />
                  <span>Custom </span>
                  <span className="option-edit">Edit</span>
                </div>
              </div>
            </>
          )}

          {selectedSection === "Account" && (
            <>
              <h2 className="option-heading">My Account</h2>

              <div className="option-section">
                <h3 className="option-subheading">Email</h3>
                <input
                  type="text"
                  className="account-input"
                  value={userInfo.email}
                  readOnly
                />
              </div>

              <div className="option-section">
                <h3 className="option-subheading">First Name</h3>
                <input
                  type="text"
                  className="account-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div className="option-section">
                <h3 className="option-subheading">Phone</h3>
                <input
                  type="text"
                  className="account-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <button className="save-account-btn" onClick={saveAccountChanges}>
                Save Changes
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Preferences;
