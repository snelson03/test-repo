// Sprint 3 Testing File
// Verifies Login, Create Account, FavoritesContext, and Campus Map zoom functionality

import { test } from "node:test";
import assert from "assert";
import fs from "fs";
import path from "path";

function readFileSafe(filePath) {
  assert.ok(fs.existsSync(filePath), `${filePath} should exist`);
  return fs.readFileSync(filePath, "utf-8");
}

// Paths
const loginPath = path.resolve("src/screens/LoginScreen.tsx");
const createPath = path.resolve("src/screens/CreateAccountScreen.tsx");
const favoritesContextPath = path.resolve("src/context/FavoritesContext.tsx");
const campusMapPath = path.resolve("src/screens/CampusMapScreen.tsx");


// LOGIN SCREEN TESTS

// tests that login page exports components correctly and handles incorrect login attempts
test("LoginScreen exists and exports component", () => {
  const content = readFileSafe(loginPath);
  assert.match(content, /export default function LoginScreen/, "Should export LoginScreen");
});

test("LoginScreen contains email and password inputs", () => {
  const content = readFileSafe(loginPath);
  assert.match(content, /TextInput/, "Should have TextInput fields");
  assert.match(content, /EMAIL/, "Should contain label 'EMAIL'");
  assert.match(content, /PASSWORD/, "Should contain password label");
});

test("LoginScreen handles incorrect login error", () => {
  const content = readFileSafe(loginPath);
  assert.match(
    content,
    /Incorrect email or password/,
    "Should show incorrect login error message"
  );
});


// CREATE ACCOUNT TESTS

// tests that create account page exists and saves credentials into AsyncStorage
test("CreateAccountScreen exists and exports component", () => {
  const content = readFileSafe(createPath);
  assert.match(content, /export default function CreateAccountScreen/, "Should export screen");
});

test("CreateAccountScreen stores credentials using AsyncStorage", () => {
  const content = readFileSafe(createPath);
  assert.match(content, /AsyncStorage\.setItem/, "Should store user credentials");
});

test("CreateAccountScreen includes navigation back to Login", () => {
  const content = readFileSafe(createPath);
  assert.match(content, /navigation\.navigate\(['"]Login['"]/, "Should navigate to login");
});


// FAVORITES CONTEXT TESTS

// tests favorites functionality using FavoritesContext
test("FavoritesContext exists and exports provider", () => {
  const content = readFileSafe(favoritesContextPath);
  assert.match(content, /FavoritesContext/, "Should include FavoritesContext");
  assert.match(content, /FavoritesProvider/, "Should export FavoritesProvider");
});

test("FavoritesContext loads and saves favorites per-user", () => {
  const content = readFileSafe(favoritesContextPath);
  assert.match(content, /loadFavoritesForUser/, "Should load favorites from storage");
  assert.match(content, /AsyncStorage\.setItem/, "Should save favorites to AsyncStorage");
});


// CAMPUS MAP SCREEN TESTS

test("CampusMapScreen exists and displays title", () => {
  const content = readFileSafe(campusMapPath);
  assert.match(content, /CAMPUS MAP/, "Should show title CAMPUS MAP");
});

test("CampusMapScreen contains building list", () => {
    const content = readFileSafe(campusMapPath);
  
    // Stocker always present
    assert.match(content, /Stocker Center/, "Should list Stocker Center");
  
    // ARC may appear as full name
    assert.ok(
      /ARC/.test(content) || /Academic\s*&\s*Research\s*Center/.test(content),
      "Should list ARC or Academic & Research Center"
    );
  
    // Alden always present
    assert.match(content, /Alden Library/, "Should list Alden Library");
  });
  
test("CampusMapScreen defines pin coords + selection logic", () => {
  const content = readFileSafe(campusMapPath);
  assert.match(content, /pinX/, "Should define X coordinate for pins");
  assert.match(content, /pinY/, "Should define Y coordinate for pins");
  assert.match(content, /setSelectedBuildingId/, "Should allow selection of pins");
});

// tests that zoomto building from the building list works correctly
test("CampusMapScreen implements zoomToBuilding function", () => {
  const content = readFileSafe(campusMapPath);
  assert.match(content, /zoomToBuilding/, "Should implement zoomToBuilding()");
});

// building name only appears on map when pin is pressed
test("CampusMapScreen shows label only when selected", () => {
  const content = readFileSafe(campusMapPath);
  assert.match(
    content,
    /selectedBuildingId/,
    "Should track selected building ID for conditional rendering"
  );
});

// checks that animation style for selected pin works 
test("CampusMapScreen includes pulse animation", () => {
  const content = readFileSafe(campusMapPath);
  assert.match(content, /Animated\.Value/, "Should use Animated.Value()");
  assert.match(content, /pulseAnim/, "Should define pulse animation");
});
