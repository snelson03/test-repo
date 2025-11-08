import { test } from "node:test";
import assert from "assert";
import fs from "fs";
import path from "path";

const appPath = path.resolve("src/App.tsx"); // or "src/main.tsx" depending on your setup
const sidebarPath = path.resolve("src/components/Sidebar/sidebar.tsx");

// Safe read helper
function readFileSafe(filePath) {
  assert.ok(fs.existsSync(filePath), `${filePath} should exist`);
  return fs.readFileSync(filePath, "utf-8");
}

// Core route existence
test("Navigation routes exist for all required pages", () => {
  const appContent = readFileSafe(appPath);

  const expectedRoutes = [
    { path: "/", component: "Home" },
    { path: "/find-room", component: "FindRoom" },
    { path: "/campus-map", component: "CampusMap" },
    { path: "/favorites", component: "Favorites" },
    { path: "/preferences", component: "Preferences" },
  ];

  // Check React Router setup
  assert.match(appContent, /Router|BrowserRouter/, "App should use React Router");
  assert.match(appContent, /Routes/, "App should include a <Routes> block with multiple <Route> entries");

  // Verify all expected routes
  for (const { path: route, component } of expectedRoutes) {
    assert.match(
      appContent,
      new RegExp(`<Route[^>]+path=["']${route}["']`, "i"),
      `App should define a route for path: ${route}`
    );
    assert.match(
      appContent,
      new RegExp(component, "i"),
      `App should render component ${component} for path: ${route}`
    );
  }
});

// Sidebar navigation links (if Sidebar exists)
test("Sidebar provides navigation links to key pages", () => {
  const sidebar = readFileSafe(sidebarPath);

  const navTargets = [
    "/",
    "/find-room",
    "/campus-map",
    "/favorites",
    "/preferences",
  ];

  for (const target of navTargets) {
    assert.match(sidebar, new RegExp(target), `Sidebar should include link to ${target}`);
  }

  assert.match(sidebar, /Link|NavLink/, "Sidebar should use React Router <Link> or <NavLink> components");
});

// Placeholder existence checks (optional)
test("Placeholder components exist for all pages", () => {
  const expectedFiles = [
    "src/pages/Home/Home.tsx",
    "src/pages/FindRoom/FindRoom.tsx",
    "src/pages/CampusMap/CampusMap.tsx",
    "src/pages/Favorites/Favorites.tsx",
    "src/pages/Preferences/Preferences.tsx",
  ];

  for (const f of expectedFiles) {
    assert.ok(fs.existsSync(f), `${f} should exist as a placeholder page component`);
  }
});
