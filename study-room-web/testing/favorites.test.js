import { test } from "node:test";
import assert from "assert";
import fs from "fs";
import path from "path";

const favoritesPath = path.resolve("src/pages/Favorites/Favorites.tsx");
const cssPath = path.resolve("src/pages/Favorites/favorites.css");

// Safe file reading
function readFileSafe(filePath) {
  assert.ok(fs.existsSync(filePath), `${filePath} should exist`);
  return fs.readFileSync(filePath, "utf-8");
}

// Core component existence
test("Favorites.tsx exists and renders key sections", () => {
  const content = readFileSafe(favoritesPath);

  // Basic structure
  assert.match(content, /favorites-page/, "Favorites should include main .favorites-page div");
  assert.match(content, /favorites-container/, "Favorites should include main .favorites-container section");
  assert.match(content, /Sidebar/, "Favorites should render Sidebar component");
  assert.match(content, /Favorites/, "Favorites should display 'Favorites' header text");

  // Main functional UI sections
  assert.match(content, /favorites-list-wrapper/, "Favorites should include favorites-list-wrapper");
  assert.match(content, /favorites-list3/, "Favorites should include favorites-list3");
  assert.match(content, /edit-btn/, "Favorites should include an edit button");
});

// List & items tests (adjusted for dynamic rendering)
test("Favorites.tsx defines favorite items with building/floor, status and numbers (dynamic)", () => {
  const content = readFileSafe(favoritesPath);

  // Ensure building names appear (they are present as string literals in the favorites array)
  const expectedBuildings = ["Stocker Center", "Academic & Research Center", "Alden Library"];
  for (const b of expectedBuildings) {
    assert.match(content, new RegExp(b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `Favorites list should include building: ${b}`);
  }

  // Ensure floors (like "1F", "2F", "3F") are present in the source (either as literals or referenced via room.floor)
  const expectedFloors = ["1F", "2F", "3F"];
  for (const f of expectedFloors) {
    assert.ok(
      /\{room\.floor\}/.test(content) || new RegExp(`\\b${f}\\b`).test(content),
      `Favorites should reference floor ${f} or render it dynamically`
    );
  }

  // Check the favorites array contains the literal room numbers (these exist in the static const)
  const expectedNumbers = [155, 212, 315, 103, 207, 121];
  for (const n of expectedNumbers) {
    assert.match(content, new RegExp(`\\b${n}\\b`), `Favorites should include room number ${n} in the static favorites array`);
  }

  // Status usage (statuses are present in the type and/or array)
  assert.match(content, /available/, "Favorites should include 'available' status");
  assert.match(content, /busy/, "Favorites should include 'busy' status");
  assert.match(content, /offline/, "Favorites should include 'offline' status");

  // Markup classes and elements
  assert.match(content, /favorite-item/, "Each favorite should render a .favorite-item");
  assert.match(content, /room-name/, "Favorite should include .room-name span");
  assert.match(content, /room-status/, "Favorite should include .room-status wrapper");
  assert.match(content, /status-dot/, "Favorite should include .status-dot element");
  assert.match(content, /room-number/, "Favorite should include .room-number element");
});

// CSS layout tests
test("favorites.css defines layout and list styles", () => {
  const css = readFileSafe(cssPath);

  // Layout checks
  assert.match(css, /\.favorites-page/, "CSS should define .favorites-page");
  assert.match(css, /display:\s*flex/, "Layout should use flexbox for page");
  assert.match(css, /\.favorites-container/, "CSS should define .favorites-container");
  assert.match(css, /\.favorites-list3/, "CSS should define .favorites-list3");

  // Item visuals and controls
  assert.match(css, /\.favorite-item/, "CSS should define .favorite-item");
  assert.match(css, /\.edit-btn/, "CSS should define .edit-btn");
  assert.match(css, /\.status-dot/, "CSS should define .status-dot");

  // Typography
  assert.match(css, /Bebas Neue/, "CSS should import Bebas Neue font");
  assert.match(css, /Inter/, "CSS should reference Inter font for text elements");
});

// Code quality checks (allowing inline style only for status-dot)
test("Favorites.tsx follows clean code practices (inline style limited to status-dot)", () => {
  const content = readFileSafe(favoritesPath);

  // No debugging console logs
  assert.ok(!content.match(/console\./), "No console debugging statements should be present");

  // Ensure the inline style usage exists for status-dot (backgroundColor)
  assert.match(content, /className=["']status-dot["'][\s\S]*style=\{\{\s*backgroundColor/, "Status dot should use inline style backgroundColor");

  // Ensure there are no other style={{ ... }} usages away from the status-dot
  const otherStyleMatches = [...content.matchAll(/\bstyle=\{\{([\s\S]*?)\}\}/g)];
  const bad = otherStyleMatches.some((m) => {
    const idx = m.index || 0;
    const surrounding = content.slice(Math.max(0, idx - 120), idx + (m[0]?.length || 0) + 120);
    return !/status-dot/.test(surrounding);
  });
  assert.ok(!bad, "Inline styles should only be used for the status-dot backgroundColor");

  // No obvious 'unused' placeholders
  assert.ok(!content.match(/unused/i), "No obvious 'unused' keywords or placeholders should be present");
});
