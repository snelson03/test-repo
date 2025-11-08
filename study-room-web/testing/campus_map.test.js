import { test } from "node:test";
import assert from "assert";
import fs from "fs";
import path from "path";

const campusMapPath = path.resolve("src/pages/CampusMap/CampusMap.tsx");
const cssPath = path.resolve("src/pages/CampusMap/campusmap.css");

// Safe file reading
function readFileSafe(filePath) {
  assert.ok(fs.existsSync(filePath), `${filePath} should exist`);
  return fs.readFileSync(filePath, "utf-8");
}

// Core component existence
test("CampusMap.tsx exists and renders key sections", () => {
  const content = readFileSafe(campusMapPath);

  // Basic structure
  assert.match(content, /map-container/, "CampusMap should include main .map-container div");
  assert.match(content, /map-content/, "CampusMap should include main .map-content section");
  assert.match(content, /Sidebar/, "CampusMap should render Sidebar component");
  assert.match(content, /header/, "CampusMap should include header section/class");
  assert.match(content, /Campus Map/, "CampusMap should display 'Campus Map' header text");

  // Main functional UI sections
  assert.match(content, /map-section/, "CampusMap should include map-section");
  assert.match(content, /map-with-key/, "CampusMap should include map-with-key wrapper");
  assert.match(content, /building-key-container/, "CampusMap should include building-key-container");
  assert.match(content, /buildings-list/, "CampusMap should include buildings-list");
});

// Map & building list tests
test("CampusMap.tsx defines map image and building list with images/addresses", () => {
  const content = readFileSafe(campusMapPath);

  // Imported assets
  assert.match(content, /MapPlaceholder/, "CampusMap should import MapPlaceholder image");
  assert.match(content, /Arc/, "CampusMap should import Arc image");
  assert.match(content, /Stocker/, "CampusMap should import Stocker image");
  assert.match(content, /Alden/, "CampusMap should import Alden image");

  // Map structure and image tag
  assert.match(content, /className=["']map["']/, "CampusMap should include an element with class 'map'");
  assert.match(content, /<img\s+src=\{MapPlaceholder\}/, "CampusMap should render the campus map image");

  // Building list items & addresses
  const expectedBuildings = [
    "Academic & Research Center",
    "Stocker Center",
    "Alden Library",
  ];
  for (const b of expectedBuildings) {
    assert.match(content, new RegExp(b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `Buildings list should include: ${b}`);
  }

  // Check for address classes used in markup
  assert.match(content, /arc-address/, "CampusMap should include arc-address class for ARC address");
  assert.match(content, /stocker-address/, "CampusMap should include stocker-address class for Stocker address");
  assert.match(content, /alden-address/, "CampusMap should include alden-address class for Alden address");
});

// CSS layout tests
test("CampusMap CSS defines layout, map, and building-list classes", () => {
  const css = readFileSafe(cssPath);

  // Layout checks
  assert.match(css, /\.map-container/, "CSS should define main map-container layout");
  assert.match(css, /display:\s*flex/, "Layout should use flexbox for container");
  assert.match(css, /\.map-content/, "CSS should define .map-content");
  assert.match(css, /\.map\s*\{/, "CSS should define .map styling block");
  assert.match(css, /\.buildings-list/, "CSS should define .buildings-list");

  // Building visuals and key bar
  assert.match(css, /\.buildings/, "CSS should define .buildings container");
  assert.match(css, /\.key-bar/, "CSS should define .key-bar style");

  // Image rules
  assert.match(css, /\.stocker img/, "CSS should define .stocker img rules");
  assert.match(css, /\.arc img/, "CSS should define .arc img rules");
  assert.match(css, /\.alden img/, "CSS should define .alden img rules");

  // Typography
  assert.match(css, /Bebas Neue/, "CSS should import Bebas Neue font");
  assert.match(css, /Inter/, "CSS should use Inter font for text elements");
});

// Code quality checks
test("CampusMap.tsx follows clean code practices", () => {
  const content = readFileSafe(campusMapPath);

  assert.ok(!content.match(/style=\{\{/), "Inline styles should not be used in CampusMap.tsx");
  assert.ok(!content.match(/console\./), "No console debugging statements should be present");
  assert.ok(!content.match(/unused/i), "No obvious 'unused' keywords or placeholders should be present");
});
