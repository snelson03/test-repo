import { test } from "node:test";
import assert from "assert";
import fs from "fs";
import path from "path";

const findRoomPath = path.resolve("src/pages/FindRoom/FindRoom.tsx");
const cssPath = path.resolve("src/pages/FindRoom/findroom.css");

// Safe file reading
function readFileSafe(filePath) {
  assert.ok(fs.existsSync(filePath), `${filePath} should exist`);
  return fs.readFileSync(filePath, "utf-8");
}

// Core component existence
test("FindRoom.tsx exists and renders key sections", () => {
  const content = readFileSafe(findRoomPath);

  // Basic structure
  assert.match(content, /find-room-container/, "FindRoom should include main .find-room-container div");
  assert.match(content, /find-room-content/, "FindRoom should include main .find-room-content section");
  assert.match(content, /Sidebar/, "FindRoom should render Sidebar component");
  assert.match(content, /find-room-header/, "FindRoom should include header section");
  assert.match(content, /Find a Room/, "FindRoom should display 'Find a Room' header text");

  // Main functional UI sections
  assert.match(content, /building-floor-selector/, "FindRoom should include building-floor-selector");
  assert.match(content, /room-grid/, "FindRoom should include room-grid section");
});

// Dropdown tests
test("FindRoom.tsx defines a dropdown with multiple building and floor options", () => {
  const content = readFileSafe(findRoomPath);

  const expectedBuildings = [
    "Stocker Center, 1F",
    "Stocker Center, 2F",
    "Stocker Center, 3F",
    "Academic & Research Center, 1F",
    "Alden Library, 7F",
  ];

  for (const item of expectedBuildings) {
    assert.match(content, new RegExp(item), `Dropdown should include option: ${item}`);
  }

  assert.match(content, /dropdown-menu/, "FindRoom should define a dropdown-menu element");
  assert.match(content, /useState/, "FindRoom should use React useState hook for dropdown toggle");
});

// Room grid tests
test("FindRoom.tsx includes multiple rooms with varied statuses", () => {
  const content = readFileSafe(findRoomPath);

  const expectedRooms = [151, 152, 153, 154, 155, 156, 157, 158];
  for (const number of expectedRooms) {
    assert.match(content, new RegExp(number.toString()), `Room grid should include room number ${number}`);
  }

  const statuses = ["available", "occupied", "offline"];
  for (const s of statuses) {
    assert.match(content, new RegExp(s), `Room grid should include ${s} status`);
  }

  assert.match(content, /room-number/, "Each room should include a visible room-number span");
});

// CSS layout tests
test("FindRoom CSS defines layout, grid, and room status classes", () => {
  const css = readFileSafe(cssPath);

  // Layout checks
  assert.match(css, /\.find-room-container/, "CSS should define main container layout");
  assert.match(css, /display:\s*flex/, "Layout should use flexbox for container");
  assert.match(css, /\.room-grid/, "CSS should define grid layout for rooms");

  // Room visuals
  assert.match(css, /\.room\.available/, "CSS should define .room.available style");
  assert.match(css, /\.room\.occupied/, "CSS should define .room.occupied style");
  assert.match(css, /\.room\.offline/, "CSS should define .room.offline style");

  // Typography
  assert.match(css, /Bebas Neue/, "CSS should import Bebas Neue font");
  assert.match(css, /Inter/, "CSS should use Inter font for text elements");
});

// Code quality checks
test("FindRoom.tsx follows clean code practices", () => {
  const content = readFileSafe(findRoomPath);

  assert.ok(!content.match(/style={{/), "Inline styles should not be used in FindRoom.tsx");
  assert.ok(!content.match(/console\./), "No console debugging statements should be present");
  assert.ok(!content.match(/unused/i), "No unused variables should be present");
});
