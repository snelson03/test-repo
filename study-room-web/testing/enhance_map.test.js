import { test } from "node:test";
import assert from "node:assert";
import fs from "fs";

const file = "src/pages/CampusMap/CampusMap.tsx";
const read = () => fs.readFileSync(file, "utf8");

test("CampusMap.tsx defines pin objects for ARC, Stocker, and Alden", () => {
  const src = read();

  assert.match(src, /id:\s*"arc"/, "ARC pin should exist");
  assert.match(src, /id:\s*"stocker"/, "Stocker pin should exist");
  assert.match(src, /id:\s*"alden"/, "Alden pin should exist");
});

test("CampusMap.tsx renders pin-container elements on the map", () => {
  const src = read();

  assert.match(
    src,
    /className="pin-container"/,
    "Should render elements with class pin-container"
  );

  assert.match(
    src,
    /className="map-pin"/,
    "Pins should use class map-pin"
  );
});
