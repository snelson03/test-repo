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

test("buildingData defines multiple floors per building and Alden has 7 floors", () => {
  const content = readFileSafe(findRoomPath);
  assert.match(content, /"Stocker Center"/, "buildingData should include 'Stocker Center'");
  assert.match(content, /"Academic & Research Center"/, "buildingData should include 'Academic & Research Center'");
  assert.match(content, /"Alden Library"/, "buildingData should include 'Alden Library'");
  assert.match(content, /"7F"/, "Alden Library should include '7F' floor");
  assert.match(content, /genRooms\(\s*151\s*,\s*8\s*\)/, "Stocker Center 1F should be generated with genRooms(151, 8)");
  assert.match(content, /genRooms\(\s*720\s*,\s*8\s*\)/, "Alden 7F should be generated with genRooms(720, 8)");
});

test("genRooms cycles statuses and is used to produce dynamic room lists", () => {
  const content = readFileSafe(findRoomPath);

  assert.match(
    content,
    /\bconst\s+statuses\s*[:=]/,
    "genRooms should declare a statuses variable"
  );

  assert.match(
    content,
    /Array\.from\(\s*\{\s*length\s*:\s*count\s*\}\s*\)\.map\s*\(/,
    "genRooms should use Array.from({ length: count }).map(...) to generate rooms"
  );

  assert.match(
    content,
    /statuses\[\s*i\s*%\s*statuses\.length\s*\]/,
    "genRooms should cycle statuses using statuses[i % statuses.length]"
  );
});

test("FindRoom maps roomsForSelected to .room elements and uses room.status for classes", () => {
  const content = readFileSafe(findRoomPath);

  assert.match(
    content,
    /const\s+roomsForSelected\s*=\s*buildingData\[selectedBuilding\]\[selectedFloor\]\s*\?\?\s*\[\s*\]/,
    "Component should derive roomsForSelected from buildingData[selectedBuilding][selectedFloor]"
  );

  assert.match(content, /roomsForSelected\.map\(\s*\(room\)\s*=>\s*\(/, "roomsForSelected should be mapped to JSX elements");

  assert.ok(
    /className=\{`room\s*\$\{room\.status\}`\}/.test(content) ||
    /className=\{\s*["']room["']\s*\+\s*room\.status\s*\}/.test(content) ||
    /className=\{`room\s*\$\{room\.status\}`\}/.test(content) ||
    /className=\{`room\s+\$\{room\.status\}`\}/.test(content),
    "Room element should apply a dynamic class combining 'room' and room.status"
  );

  assert.match(content, /<span\s+className=["']room-number["']>\s*\{room\.number\}\s*<\/span>/, "Each room item should include a span with className 'room-number' displaying room.number");

  assert.match(content, /<section[^>]*className=["']room-grid["'][^>]*aria-live=["']polite["']/, "room-grid should have aria-live='polite' for dynamic updates");
});

test("findroom.css defines grid layout and room sizing/status colors", () => {
  const css = readFileSafe(cssPath);
  assert.match(css, /grid-template-columns\s*:\s*repeat\(\s*4\s*,\s*1fr\s*\)/, "room-grid should use grid-template-columns: repeat(4, 1fr)");
  assert.match(css, /gap\s*:\s*2rem/, "room-grid should define a gap for grid items");
  assert.match(css, /\.room\s*\{[^}]*width\s*:\s*200px/m, "Each .room should define width: 200px");
  assert.match(css, /\.room\.available/, ".room.available should be defined");
  assert.match(css, /\.room\.occupied/, ".room.occupied should be defined");
  assert.match(css, /\.room\.offline/, ".room.offline should be defined");
});
