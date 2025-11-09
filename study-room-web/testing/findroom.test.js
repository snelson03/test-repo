import { test } from "node:test";
import assert from "assert";
import fs from "fs";
import path from "path";

const findRoomPath = path.resolve("src/pages/FindRoom/FindRoom.tsx");
const cssPath = path.resolve("src/pages/FindRoom/findroom.css");

function readFileSafe(filePath) {
  assert.ok(fs.existsSync(filePath), `${filePath} should exist`);
  return fs.readFileSync(filePath, "utf-8");
}

test("FindRoom.tsx exists and renders key sections", () => {
  const content = readFileSafe(findRoomPath);
  assert.match(content, /find-room-container/, "FindRoom should include main .find-room-container div");
  assert.match(content, /find-room-content/, "FindRoom should include main .find-room-content section");
  assert.match(content, /Sidebar/, "FindRoom should render Sidebar component");
  assert.match(content, /find-room-header/, "FindRoom should include header section/class");
  assert.match(content, /Find a Room/, "FindRoom should display 'Find a Room' header text");
  assert.match(content, /building-floor-selector/, "FindRoom should include building-floor-selector");
  assert.match(content, /room-grid/, "FindRoom should include room-grid section");
});

test("FindRoom dropdown structure: buildings + floor buttons", () => {
  const content = readFileSafe(findRoomPath);

  // Building names present
  const buildings = ["Stocker Center", "Academic & Research Center", "Alden Library"];
  for (const b of buildings) {
    assert.match(content, new RegExp(b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `Dropdown should include building: ${b}`);
  }

  // Ensure dropdown markup produces buttons for floors (structure check)
  assert.match(content, /dropdown-building-name/, "FindRoom should output building names with class dropdown-building-name");
  assert.match(content, /dropdown-item/, "FindRoom should define dropdown-item floor buttons");
  assert.match(content, /Object\.keys\(buildingData\[bld\]\)\.map\(\(floor\)/, "Source should map per-building floors to dropdown buttons");
});

test("FindRoom renders dynamic rooms mapping and uses status classes", () => {
  const content = readFileSafe(findRoomPath);

  assert.match(content, /const\s+roomsForSelected\s*=\s*buildingData\[selectedBuilding\]\[selectedFloor\]\s*\?\?\s*\[\s*\]/, "Component should derive roomsForSelected from buildingData[selectedBuilding][selectedFloor]");
  assert.match(content, /roomsForSelected\.map\(\s*\(room\)\s*=>\s*\(/, "roomsForSelected should be mapped to JSX elements");
  assert.match(content, /<span\s+className=["']room-number["']>\s*\{room\.number\}\s*<\/span>/, "Each room item should include a span for room.number");
  assert.match(content, /className=.*room.*room\.status/, "Room element should include a class that uses room.status");
  assert.match(content, /aria-live=["']polite["']/, "room-grid should have aria-live='polite' for dynamic updates");
});

test("findroom.css defines layout, grid, and room status classes", () => {
  const css = readFileSafe(cssPath);
  assert.match(css, /\.find-room-container/, "CSS should define main container layout");
  assert.match(css, /display:\s*flex/, "Layout should use flexbox for container");
  assert.match(css, /\.room-grid/, "CSS should define grid layout for rooms");
  assert.match(css, /\.room\.available/, "CSS should define .room.available style");
  assert.match(css, /\.room\.occupied/, "CSS should define .room.occupied style");
  assert.match(css, /\.room\.offline/, "CSS should define .room.offline style");
});
