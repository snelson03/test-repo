import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/sidebar";
import "./home.css";
import MapImage from "../../assets/map.jpeg";
import { usersAPI, buildingsAPI } from "../../utils/api";
import type { Room } from "../../utils/api";

interface BuildingSummary {
  name: string;
  availableCount: number;
  totalCount: number;
}

const Home: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [buildingSummaries, setBuildingSummaries] = useState<BuildingSummary[]>(
    []
  );
  const [favorites, setFavorites] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user
        const user = await usersAPI.getCurrentUser();
        const fullName = user.full_name || "";
        setFirstName(fullName.split(" ")[0] || "");

        // Get buildings and favorites in parallel
        const [buildings, favoriteRooms] = await Promise.all([
          buildingsAPI.getAll(),
          usersAPI.getFavorites(),
        ]);

        // Create building map for favorites
        const buildingMap: Map<number, string> = new Map();
        buildings.forEach((b) => buildingMap.set(b.id, b.name));

        // Add building names to favorite rooms
        const favoritesWithBuildings = favoriteRooms.map((room) => ({
          ...room,
          building: {
            id: room.building_id,
            name: buildingMap.get(room.building_id) || "Unknown Building",
            address:
              buildings.find((b) => b.id === room.building_id)?.address || null,
            number_of_floors:
              buildings.find((b) => b.id === room.building_id)
                ?.number_of_floors || null,
          },
        }));

        setFavorites(favoritesWithBuildings);

        // Calculate available rooms for each building
        const summaries: BuildingSummary[] = [];

        for (const building of buildings) {
          const rooms = await buildingsAPI.getRooms(building.id);
          const availableCount = rooms.filter((r) => r.is_available).length;
          summaries.push({
            name: building.name,
            availableCount,
            totalCount: rooms.length,
          });
        }

        setBuildingSummaries(summaries);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="home-container">
      <Sidebar />
      <main className="home-content">
        <h1 className="welcome-text">Welcome back, {firstName}!</h1>

        <section className="summary">
          <div className="summary-bar">
            {loading ? (
              <div>Loading...</div>
            ) : (
              <>
                {buildingSummaries.map((summary) => {
                  let statusClass = "red";
                  let statusText = "All rooms full";

                  if (summary.availableCount > 0) {
                    statusClass =
                      summary.availableCount >= 5 ? "green" : "yellow";
                    statusText = `${summary.availableCount} room${summary.availableCount === 1 ? "" : "s"} free`;
                  }

                  return (
                    <div key={summary.name} className="summary-item">
                      <span className="building">{summary.name}</span>
                      <div className="rm_status">
                        <span className={`status-dot ${statusClass}`}></span>
                        {statusText}
                      </div>
                    </div>
                  );
                })}

                <button
                  className="see-rooms-btn"
                  onClick={() => (window.location.href = "/find-room")}
                >
                  See All Rooms →
                </button>
              </>
            )}
          </div>
        </section>

        <section className="favorites-map-container">
          <section className="favorites-rooms">
            <div className="favorites">
              <div className="favorites-bar">Favorites</div>
              <ul className="favorites-list">
                {loading ? (
                  <li>Loading favorites...</li>
                ) : favorites.length === 0 ? (
                  <li>No favorites yet</li>
                ) : (
                  favorites.map((room) => {
                    const statusClass = room.is_available
                      ? "available"
                      : "occupied";
                    const buildingName =
                      room.building?.name || "Unknown Building";
                    return (
                      <li key={room.id} className={statusClass}>
                        {buildingName} {room.room_number}
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          </section>

          <section className="map-section">
            <div className="map">
              <img src={MapImage} alt="Campus Map" />
            </div>
          </section>
        </section>
      </main>
    </div>
  );
};

export default Home;
