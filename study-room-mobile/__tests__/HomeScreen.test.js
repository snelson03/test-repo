// Tests layout and structures of home page

import { test } from "node:test";
import assert from "assert";
import fs from "fs";
import path from "path";

// Path to Home Screen
const homePath = path.resolve("src/screens/HomeScreen.tsx");

// Safe file reading
function readFileSafe(filePath) {
  assert.ok(fs.existsSync(filePath), `${filePath} should exist`);
  return fs.readFileSync(filePath, "utf-8");
}

// Test: file exists and contains component definition
test("HomeScreen exists and defines component", () => {
  const content = readFileSafe(homePath);
  assert.match(content, /export default function HomeScreen/, "HomeScreen component should exist");
  assert.match(content, /useState/, "Should import useState");
  assert.match(content, /useRef/, "Should import useRef");
  assert.match(content, /ScrollView/, "Should use ScrollView");
  assert.match(content, /View/, "Should use View");
  assert.match(content, /Text/, "Should use Text");
});

// Test: Header and welcome section
test("HomeScreen has header and welcome message", () => {
  const content = readFileSafe(homePath);
  assert.match(content, /styles\.header/, "Header style should exist");
  assert.match(content, /styles\.welcome/, "Welcome message style should exist");
  assert.match(content, /Welcome Back, Ms773121!/, "Welcome text should exist");
});

// Test: Find a Room and Campus Map sections
test("HomeScreen has Find a Room and Campus Map sections", () => {
  const content = readFileSafe(homePath);
  assert.match(content, /FIND A ROOM/, "Find a Room section should exist");
  assert.match(content, /CAMPUS MAP/, "Campus Map section should exist");
  assert.match(content, /bannerContainer/, "bannerContainer style should exist");
  assert.match(content, /mapContainer/, "mapContainer style should exist");
});

// Test: Room cards and Favorites
test("HomeScreen has room cards and favorites", () => {
  const content = readFileSafe(homePath);
  assert.match(content, /Stocker Center/, "Should include Stocker Center");
  assert.match(content, /ARC/, "Should include ARC");
  assert.match(content, /Alden Library/, "Should include Alden Library");
  assert.match(content, /MY FAVORITES/, "Should include My Favorites card");
  assert.match(content, /PREFERENCES/, "Should include Preferences card");
});

// Test: Dropdown menu button
test("HomeScreen has menu button", () => {
  const content = readFileSafe(homePath);
  assert.match(content, /Feather name="menu"/, "Menu button should exist");
  assert.match(content, /toggleMenu/, "toggleMenu function should exist");
});
