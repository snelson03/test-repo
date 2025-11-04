import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Home from './pages/Home/Home';
import FindRoom from './pages/FindRoom/FindRoom';
import CampusMap from './pages/CampusMap/CampusMap';
import Favorites from './pages/Favorites/Favorites';
import Preferences from './pages/Preferences/Preferences';

import TopNavLayout from './layouts/TopNavLayout';

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/find-room" element={<FindRoom />} />
        <Route path="/campus-map" element={<CampusMap />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/preferences" element={<Preferences />} />

      </Routes>
    </Router>
  );
}

export default App
