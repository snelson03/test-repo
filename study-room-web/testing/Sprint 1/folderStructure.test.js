import { test } from "node:test";
import fs from "fs";
import path from "path";
import assert from "assert";

const projectRoot = path.resolve("src");

const expectedFolders = [
  "components",
  "assets",
  "pages",
  "navigation", // adjust to 'navigations' if that’s your folder name
];

const colorFileCandidates = [
  "colors.ts",
  "colors.js",
  "theme/colors.ts",
  "theme/colors.js",
  "assets/colors.ts",
  "assets/colors.js",
];

test("Base folders exist in /src", () => {
  expectedFolders.forEach((folder) => {
    const folderPath = path.join(projectRoot, folder);
    assert.ok(fs.existsSync(folderPath), `Missing folder: ${folder}`);
  });
});

test("Color palette file exists and contains OU colors", () => {
  const foundFile = colorFileCandidates.find((file) =>
    fs.existsSync(path.join(projectRoot, file))
  );

  assert.ok(foundFile, "No color palette file found in expected locations");

  const content = fs
    .readFileSync(path.join(projectRoot, foundFile), "utf-8")
    .toLowerCase();

  // OU official green is roughly #154734 (dark green), white (#FFFFFF), black (#000000)
  const hasOUColors =
    content.includes("#154734") ||
    content.includes("green") ||
    content.includes("white") ||
    content.includes("#ffffff");

  assert.ok(hasOUColors, "Color palette file does not include OU colors");
});
