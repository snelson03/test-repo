import { test } from "node:test";
import fs from "fs";
import path from "path";
import assert from "assert";

const pkgPath = path.resolve("package.json");
const tsConfigPath = path.resolve("tsconfig.json");
const viteConfigPath = path.resolve("vite.config.ts");
const srcPath = path.resolve("src");
const mainFile = path.join(srcPath, "main.tsx");

// Helper to read JSON safely
function readJsonSafe(filePath) {
  assert.ok(fs.existsSync(filePath), `${filePath} should exist`);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

// 1️⃣ Check core project structure
test("React project is initialized with web support", () => {
  assert.ok(fs.existsSync(pkgPath), "package.json should exist");
  assert.ok(fs.existsSync(srcPath), "src folder should exist");
  assert.ok(fs.existsSync(mainFile), "src/main.tsx should exist (React entry point)");
});

// 2️⃣ Check essential config files
test("Config files exist for TypeScript and Vite", () => {
  assert.ok(fs.existsSync(tsConfigPath), "tsconfig.json should exist");
  assert.ok(fs.existsSync(viteConfigPath), "vite.config.ts should exist (for web build setup)");
});

// 3️⃣ Verify dependencies for React web project
test("package.json includes React and Vite dependencies", () => {
  const pkg = readJsonSafe(pkgPath);

  const deps = Object.assign({}, pkg.dependencies, pkg.devDependencies);
  const required = ["react", "react-dom", "vite"];

  required.forEach((dep) => {
    assert.ok(
      deps[dep],
      `Expected dependency "${dep}" not found in package.json`
    );
  });
});

// 4️⃣ Verify entry file renders React root
test("main.tsx initializes React app properly", () => {
  assert.ok(fs.existsSync(mainFile), "main.tsx should exist");

  const content = fs.readFileSync(mainFile, "utf-8");

  assert.match(
  content,
  /(ReactDOM\.createRoot|createRoot\s*\()/,
  "main.tsx should initialize a React root using createRoot()"
  );
  assert.match(content, /<App\s*\/>/, "main.tsx should render the <App /> component");
});
