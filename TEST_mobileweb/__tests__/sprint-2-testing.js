// Sprint 2 Testing file
// Verifies major screen components and structure for tasks implemented in sprint 2:
// Find a Room dynamic room grid, Favorites screen, Preferences screen, and Campus Map screen

import { test } from "node:test";
import assert from "assert";
import fs from "fs";
import path from "path";

// Utility
function readFileSafe(filePath) {
  assert.ok(fs.existsSync(filePath), `${filePath} should exist`);
  return fs.readFileSync(filePath, "utf-8");
}

// Paths
const findRoomPath = path.resolve("src/screens/FindRoomScreen.tsx");
const favoritesPath = path.resolve("src/screens/FavoritesScreen.tsx");
const preferencesPath = path.resolve("src/screens/PreferencesScreen.tsx");
const campusMapPath = path.resolve("src/screens/CampusMapScreen.tsx");

// Find a room screen  tests
test("FindARoomScreen exists and defines layout", () => {
  const content = readFileSafe(findRoomPath);
  assert.match(content, /export default function/, "Should export default function");
  assert.match(content, /View/, "Should use View component");
});

test("FindARoomScreen header and subheader exist", () => {
  const content = readFileSafe(findRoomPath);
  assert.match(content, /FIND A ROOM/, "Should include header text 'FIND A ROOM'");
  assert.match(content, /Stocker Center/, "Should include building reference 'Stocker Center'");
});

test("FindARoomScreen includes FlatList and grid setup", () => {
  const content = readFileSafe(findRoomPath);
  assert.match(content, /FlatList/, "Should include FlatList for grid");
  assert.match(content, /numColumns/, "Should define numColumns for grid");
  assert.match(content, /columnWrapperStyle/, "Should include columnWrapperStyle");
});

test("FindARoomScreen contains room IDs and statuses", () => {
  const content = readFileSafe(findRoomPath);

  const ids = ["151", "152", "153", "154", "155"];
  for (const id of ids) {
    assert.match(content, new RegExp(id), `Should include room ID ${id}`);
  }

  // uses alid room statuses 
  const statuses = ["occupied", "available", "unknown", "offline"];
  const hasStatus = statuses.some((s) => new RegExp(s).test(content));
  assert.ok(hasStatus, "Should include at least one valid room status (occupied/available/unknown/offline)");
});

test("FindARoomScreen defines key styles", () => {
  const content = readFileSafe(findRoomPath);
  const keys = ["container", "headerWrapper", "title", "subHeader", "gridContainer", "roomBox", "roomText"];
  for (const k of keys) {
    assert.match(content, new RegExp(k), `Should include style key: ${k}`);
  }
});

// Favorites screen tests
test("FavoritesScreen exists and contains layout", () => {
  const content = readFileSafe(favoritesPath);
  assert.match(content, /export default function/, "FavoritesScreen should export a component");
  assert.match(content, /FAVORITES/, "Favorites screen should have a title");
});

test("FavoritesScreen defines room cards and heart icon", () => {
  const content = readFileSafe(favoritesPath);
  assert.match(content, /(Feather|Ionicons)/, "Should use Feather or Ionicons for heart icon");
  assert.match(content, /statusDot/, "Should define a color status dot style");
});

test("FavoritesScreen includes styles for layout and list", () => {
  const content = readFileSafe(favoritesPath);
  assert.match(content, /StyleSheet.create/, "Should define styles");
  assert.match(content, /card/, "Should include card style");
});

// Preferences screen tests
test("PreferencesScreen exists and defines layout", () => {
  const content = readFileSafe(preferencesPath);
  assert.match(content, /export default function/, "Should export default function");
  assert.match(content, /PREFERENCES/, "Should have header title");
});

test("PreferencesScreen dropdown categories exist", () => {
  const content = readFileSafe(preferencesPath);
  assert.match(content, /Notifications/, "Should include Notifications category");
  assert.match(content, /Account/, "Should include Account category");
  assert.match(content, /Groups/, "Should include Groups category");
});

test("PreferencesScreen includes key editable fields", () => {
  const content = readFileSafe(preferencesPath);
  assert.match(content, /TextInput/, "Should use TextInput for editable fields");
  assert.match(content, /setName/, "Should update name in global context");
});

test("PreferencesScreen defines styles for major sections", () => {
  const content = readFileSafe(preferencesPath);
  assert.match(content, /section/, "Should include section style");
  assert.match(content, /optionRow/, "Should include optionRow style");
  assert.match(content, /inputBox/, "Should include inputBox style");
});

// Campus map screen tests
test("CampusMapScreen exists and defines component", () => {
  const content = readFileSafe(campusMapPath);
  assert.match(content, /export default function/, "Should export default function");
  assert.match(content, /CAMPUS MAP/, "Should render title");
});

test("CampusMapScreen lists multiple buildings", () => {
  const content = readFileSafe(campusMapPath);
  // Accepts either 'ARC' or full name
  assert.match(content, /(ARC|Academic & Research Center)/, "Should list ARC/Academic & Research Center");
  assert.match(content, /Stocker Center/, "Should list Stocker Center");
  assert.match(content, /Alden Library/, "Should list Alden Library");
});

test("CampusMapScreen includes map section and styles", () => {
  const content = readFileSafe(campusMapPath);
  // Accepts either mapWrapper or mapContainer
  assert.match(content, /(mapWrapper|mapContainer)/, "Should define map container style");
  assert.match(content, /mapImage/, "Should define map image style");
});
