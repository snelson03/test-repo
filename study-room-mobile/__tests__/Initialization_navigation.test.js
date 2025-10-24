// Tests initialization of project and implemented pages
// tests navigation routes of implemented pages and buttons:
// Drop down menu, Home screen, and Find a Room screen

import { test } from 'node:test';
import assert from 'assert';
import fs from 'fs';
import path from 'path';

// Helper to safely read a file
function readFileSafe(filePath) {
  assert.ok(fs.existsSync(filePath), `${filePath} should exist`);
  return fs.readFileSync(filePath, 'utf-8');
}

// Screen paths
const homePath = path.resolve('src/screens/HomeScreen.tsx');
const findRoomPath = path.resolve('src/screens/FindRoomScreen.tsx');

// HomeScreen tests
test('HomeScreen exists and initializes variables', () => {
  const content = readFileSafe(homePath);
  assert.match(content, /useState/, 'HomeScreen should initialize state variables');
});

test('HomeScreen navigation buttons exist', () => {
  const content = readFileSafe(homePath);
  assert.match(content, /navigation.navigate/, 'HomeScreen should have navigation buttons');
});

// FindRoomScreen tests
test('FindRoomScreen exists and initializes variables', () => {
  const content = readFileSafe(findRoomPath);
  assert.match(content, /rooms\s*=\s*\[/, 'FindRoomScreen should define room data');
});

test('FindRoomScreen navigation buttons exist', () => {
  const content = readFileSafe(findRoomPath);
  assert.match(content, /router.back\(\)/, 'FindRoomScreen should have navigation buttons');
});
