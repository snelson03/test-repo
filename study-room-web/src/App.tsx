import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Home from './pages/Home';
import FindRoom from './pages/FindRoom';
import CampusMap from './pages/CampusMap';
import Favorites from './pages/Favorites';
import Preferences from './pages/Preferences';

function App() {
  return (
    <Router>
      {/* Navigation Bar */}
      <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: '#f4f4f4', }}>
        <Link to="/">Home</Link>
        <Link to="/find-room">Find a Room</Link>
        <Link to="/campus-map">Campus Map</Link>
        <Link to="/favorites">Favorites</Link>
        <Link to="/preferences">Preferences</Link>
      </nav>

      { /* This tells React which page to show */ }
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
    // <div>
    //   <h1>Study Room Availability</h1>
    //   <p>Welcome to the OU Study Room Availability app!</p>
    // </div>
//   )
// }

export default App
