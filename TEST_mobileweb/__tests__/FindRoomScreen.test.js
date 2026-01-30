// Tests layout and components of Find a Room Screen

import { test } from "node:test";
import assert from "assert";
import fs from "fs";
import path from "path";

// Path to screen file
const findRoomPath = path.resolve("src/screens/FindRoomScreen.tsx");

// Safe file reading
function readFileSafe(filePath) {
  assert.ok(fs.existsSync(filePath), `${filePath} should exist`);
  return fs.readFileSync(filePath, "utf-8");
}

// Check that the screen exports a default function and a core layout component exists
test("FindRoomScreen exists and defines component", () => {
  const content = readFileSafe(findRoomPath);
  assert.match(content, /export default function/, "FindRoomScreen should export default function");
  assert.match(content, /View/, "FindRoomScreen should use View");
});

// Tests Header and subheader
test("Header and subheader exist", () => {
  const content = readFileSafe(findRoomPath);
  assert.match(content, /FIND A ROOM/, "Screen should render title FIND A ROOM");
  assert.match(content, /Stocker Center, 1F/, "Screen should render subheader with building/floor");
});

// Tests Room grid layout
test("Room grid is set up correctly", () => {
  const content = readFileSafe(findRoomPath);

  // Check that FlatList is present
  assert.match(content, /FlatList/, "Screen should render a FlatList for rooms");
  // Check that numColumns attribute is defined 
  assert.match(content, /numColumns/, "FlatList should have numColumns defined");
  assert.match(content, /columnWrapperStyle/, "FlatList should include columnWrapperStyle for layout");
});

// Tests Room IDs and statuses
test("Rooms include correct IDs and statuses", () => {
  const content = readFileSafe(findRoomPath);

  const rooms = ["151", "152", "153", "154", "155", "156", "157", "158"];
  for (const r of rooms) {
    assert.match(content, new RegExp(r), `Room grid should include room ID ${r}`);
  }

  const statuses = ["occupied", "available", "unknown"];
  for (const s of statuses) {
    assert.match(content, new RegExp(s), `Room grid should include status ${s}`);
  }
});

  // Tests all main StyleSheet objects exist
test("All key styles exist in FindRoomScreen", () => {
  const content = readFileSafe(findRoomPath);

  assert.match(content, /container/, "Styles should include container");
  assert.match(content, /headerWrapper/, "Styles should include headerWrapper");
  assert.match(content, /title/, "Styles should include title");
  assert.match(content, /subHeader/, "Styles should include subHeader");
  assert.match(content, /gridContainer/, "Styles should include gridContainer");
  assert.match(content, /roomBox/, "Styles should include roomBox");
  assert.match(content, /roomText/, "Styles should include roomText");
});
