import { test } from "node:test";
import assert from "assert";
import fs from "fs";
import path from "path";

const prefsPath = path.resolve("src/pages/Preferences/Preferences.tsx");
const cssPath = path.resolve("src/pages/Preferences/preferences.css");

// Safe file reading
function readFileSafe(filePath) {
  assert.ok(fs.existsSync(filePath), `${filePath} should exist`);
  return fs.readFileSync(filePath, "utf-8");
}

// Core component existence
test("Preferences.tsx exists and renders key sections", () => {
  const content = readFileSafe(prefsPath);

  // Basic structure
  assert.match(content, /preferences-container/, "Preferences should include main .preferences-container div");
  assert.match(content, /preferences-content/, "Preferences should include main .preferences-content section");
  assert.match(content, /Sidebar/, "Preferences should render Sidebar component");
  assert.match(content, /Preferences/, "Preferences should display 'Preferences' header text");

  // Main UI pieces
  assert.match(content, /option-box/, "Preferences should include .option-box");
  assert.match(content, /option-heading/, "Preferences should include .option-heading");
  assert.match(content, /option-section/, "Preferences should include .option-section");
  assert.match(content, /option-subheading/, "Preferences should include .option-subheading");
});

// Options & inputs tests
test("Preferences.tsx includes notification options and checkboxes", () => {
  const content = readFileSafe(prefsPath);

  // Expected option headings/subsections
  const expectedSubheads = [
    "Notification Types",
    "Notification Methods",
    "Notification Scheduling",
  ];
  for (const sh of expectedSubheads) {
    assert.match(content, new RegExp(sh.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `Should include subsection: ${sh}`);
  }

  // Check for checkbox inputs
  assert.match(content, /input\s+type=["']checkbox["']/, "Preferences should include at least one checkbox input");

  // Check for option-item, option-edit, and text labels
  assert.match(content, /option-item/, "Preferences should render .option-item elements");
  assert.match(content, /option-edit/, "Preferences should include .option-edit links/buttons");

  // A few specific labels present in markup
  const expectedLabels = [
    "All Available Rooms",
    "Favorites Only",
    "Building Specific",
    "Email",
    "Sms",
    "9:00AM - 9:00PM",
    "Always On",
    "Custom",
  ];
  for (const label of expectedLabels) {
    assert.match(content, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `Preferences should include label: ${label}`);
  }

  // Confirm component export
  assert.match(content, /export\s+default\s+Preferences/, "Preferences.tsx should export the component as default");
});

// CSS layout tests
test("preferences.css defines layout and option styles", () => {
  const css = readFileSafe(cssPath);

  // Layout checks
  assert.match(css, /\.preferences-container/, "CSS should define .preferences-container");
  assert.match(css, /display:\s*flex/, "Layout should use flexbox for container");
  assert.match(css, /\.preferences-content/, "CSS should define .preferences-content");
  assert.match(css, /\.option-box/, "CSS should define .option-box");

  // Option elements styling
  assert.match(css, /\.option-heading/, "CSS should define .option-heading");
  assert.match(css, /\.option-section/, "CSS should define .option-section");
  assert.match(css, /\.option-item/, "CSS should define .option-item");
  assert.match(css, /\.option-edit/, "CSS should define .option-edit");

  // Typography
  assert.match(css, /Bebas Neue/, "CSS should import Bebas Neue font");
  assert.match(css, /Inter/, "CSS should reference Inter font for text elements");
});

// Code quality checks
test("Preferences.tsx follows clean code practices", () => {
  const content = readFileSafe(prefsPath);

  // No debugging console logs
  assert.ok(!content.match(/console\./), "No console debugging statements should be present");

  // No inline style objects used
  assert.ok(!content.match(/style=\{\{/), "Inline style objects should not be used in Preferences.tsx");

  // No obvious 'unused' placeholders
  assert.ok(!content.match(/unused/i), "No obvious 'unused' keywords or placeholders should be present");
});
