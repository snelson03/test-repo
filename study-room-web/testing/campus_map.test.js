import { test } from "node:test";
import assert from "node:assert";
import fs from "fs";
import path from "path";

const campusMapPath = path.resolve("src/pages/CampusMap/CampusMap.tsx");
const cssPath = path.resolve("src/pages/CampusMap/campusmap.css");

function read(file) {
  assert.ok(fs.existsSync(file), `${file} should exist`);
  return fs.readFileSync(file, "utf8");
}

test("CampusMap.tsx contains core layout structure", () => {
  const content = read(campusMapPath);

  assert.match(content, /map-container/, "Should contain .map-container");
  assert.match(content, /map-content/, "Should contain .map-content");
  assert.match(content, /Sidebar/, "Should import Sidebar");
  assert.match(content, /Campus Map/, "Should contain page header");
  assert.match(content, /map-section/, "Should contain map-section");
  assert.match(content, /map-with-key/, "Should contain map-with-key layout");
});

test("CampusMap.tsx imports expected building images", () => {
  const content = read(campusMapPath);

  assert.match(content, /import Map/, "Should import map image");
  assert.match(content, /import Arc/, "Should import ARC image");
  assert.match(content, /import Stocker/, "Should import Stocker image");
  assert.match(content, /import Alden/, "Should import Alden image");
});

test("CampusMap CSS defines expected layout classes", () => {
  const css = read(cssPath);

  assert.match(css, /\.map-container/, "CSS defines map-container");
  assert.match(css, /\.map-content/, "CSS defines map-content");
  assert.match(css, /\.map-with-key/, "CSS defines map-with-key");
  assert.match(css, /\.buildings-list/, "CSS defines buildings-list");

  assert.match(css, /Bebas Neue/, "Imports Bebas Neue font");
  assert.match(css, /Inter/, "Uses Inter font");
});

test("CampusMap.tsx does not contain debug statements", () => {
  const content = read(campusMapPath);
  assert.ok(!/console\./.test(content), "No console logs allowed");
});
