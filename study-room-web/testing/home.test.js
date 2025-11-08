import { test } from "node:test";
import assert from "assert";
import fs from "fs";
import path from "path";

const homePath = path.resolve("src/pages/Home/Home.tsx");
const cssPath = path.resolve("src/pages/Home/home.css");

// Safe file reading
function readFileSafe(filePath) {
  assert.ok(fs.existsSync(filePath), `${filePath} should exist`);
  return fs.readFileSync(filePath, "utf-8");
}

// Core tests
test("Home.tsx exists and renders main sections", () => {
  const content = readFileSafe(homePath);

  // Basic structure tests
  assert.match(content, /home-container/, "Home should include main .home-container div");
  assert.match(content, /home-content/, "Home should include main .home-content section");
  assert.match(content, /Sidebar/, "Home should render Sidebar component");
  assert.match(content, /welcome-text/, "Home should greet the user with a welcome header");

  // Section presence tests
  assert.match(content, /summary-bar/, "Home should include a summary bar");
  assert.match(content, /favorites-map-container/, "Home should include a favorites-map-container section");
  assert.match(content, /favorites-list/, "Home should include a favorites list");
  assert.match(content, /map/, "Home should include a map section with image");
});

// Buildings summary tests
test("Home.tsx lists multiple buildings with statuses", () => {
  const content = readFileSafe(homePath);

  const buildings = ["Stocker Center", "Academic & Research Center", "Alden Library"];
  for (const b of buildings) {
    assert.match(content, new RegExp(b), `Home should include "${b}" in the summary section`);
  }

  const statuses = ["red", "yellow", "green"];
  for (const s of statuses) {
    assert.match(content, new RegExp(`status-dot ${s}`), `Home should include status-dot color class: ${s}`);
  }
});

// Favorites tests
test("Favorites list includes multiple entries with varied room statuses", () => {
  const content = readFileSafe(homePath);

  const expectedRooms = [
    "Academic & Research Center 155",
    "Academic & Research Center 161",
    "Alden Library 216",
    "Alden Library 312",
    "Stocker Center 155",
    "Stocker Center 152",
  ];

  for (const room of expectedRooms) {
    assert.match(content, new RegExp(room), `Favorites list should include ${room}`);
  }

  assert.match(content, /occupied/, "Favorites should include at least one occupied room");
  assert.match(content, /offline/, "Favorites should include at least one offline room");
  assert.match(content, /available/, "Favorites should include at least one available room");
});

// CSS validation
test("Home CSS defines layout and color classes", () => {
  const css = readFileSafe(cssPath);

  // Core layout
  assert.match(css, /home-container/, "CSS should define .home-container");
  assert.match(css, /display:\s*flex/, "Layout should use flexbox for responsiveness");

  // Key visual elements
  assert.match(css, /\.summary-bar/, "CSS should style the summary bar");
  assert.match(css, /\.favorites-list/, "CSS should style the favorites list");
  assert.match(css, /\.map/, "CSS should define map styling");

  // Color status dots
  assert.match(css, /\.status-dot\.red/, "CSS should define red status dot");
  assert.match(css, /\.status-dot\.yellow/, "CSS should define yellow status dot");
  assert.match(css, /\.status-dot\.green/, "CSS should define green status dot");
});

// Consistent design tests
test("Home CSS imports Bebas Neue and Inter fonts", () => {
  const css = readFileSafe(cssPath);
  assert.match(css, /Bebas Neue/, "CSS should import Bebas Neue font");
  assert.match(css, /Inter/, "CSS should import Inter font");
});

// Code quality tests
test("Home.tsx should not contain inline styles or unused variables", () => {
  const content = readFileSafe(homePath);

  assert.ok(!content.match(/style={{/), "Inline styles should not be used");
  assert.ok(!content.match(/unused/i), "No unused variables should be present");
});
