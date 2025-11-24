import './App.css';
// import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home/Home';
import FindRoom from './pages/FindRoom/FindRoom';
import CampusMap from './pages/CampusMap/CampusMap';
import Favorites from './pages/Favorites/Favorites';
import Preferences from './pages/Preferences/Preferences';
import Login from "./components/Login/MockLogin";
import CreateAccount from "./components/Login/CreateAccount";

import ProtectedRoute from "./components/Login/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<CreateAccount />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/find-room"
          element={
            <ProtectedRoute>
              <FindRoom />
            </ProtectedRoute>
          }
        />

        <Route
          path="/campus-map"
          element={
            <ProtectedRoute>
              <CampusMap />
            </ProtectedRoute>
          }
        />

        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />

        <Route
          path="/preferences"
          element={
            <ProtectedRoute>
              <Preferences />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App
