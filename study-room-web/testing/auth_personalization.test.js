import { test } from "node:test";
import assert from "assert";
import fs from "fs";
import path from "path";

const read = (p) => fs.readFileSync(path.resolve(p), "utf-8");

const HOME = "src/pages/Home/Home.tsx";
const FAVORITES = "src/pages/Favorites/Favorites.tsx";
const PREFS = "src/pages/Preferences/Preferences.tsx";
const SIDEBAR = "src/components/Sidebar/sidebar.tsx";

test("Home.tsx displays logged-in user name", () => {
  const content = read(HOME);

  assert.match(
    content,
    /Welcome back,\s*\{firstName\}/i,
    "Home must interpolate firstName from logged-in user"
  );

  assert.match(
    content,
    /localStorage\.getItem\("mock_user_session"\)/,
    "Home must read mock_user_session"
  );

  assert.match(
    content,
    /users.*find/,
    "Home must look up user info from users[]"
  );
});

test("Sidebar intentionally does not render username", () => {
  const content = read(SIDEBAR);

  assert.ok(
    !/firstName|username|Welcome/i.test(content),
    "Sidebar should not attempt to display a username"
  );

  assert.match(
    content,
    /mock_user_session/,
    "Sidebar must still reference mock_user_session for logout"
  );
});

test("Favorites.tsx contains login check", () => {
  const content = read(FAVORITES);

  assert.match(
    content,
    /if\s*\(!user\)/,
    "Favorites must check for missing logged-in user"
  );

  assert.match(
    content,
    /window\.location\.href\s*=\s*["']\/login["']/,
    "Favorites must redirect when not logged in"
  );
});

test("Preferences.tsx checks and loads userPreferences", () => {
  const content = read(PREFS);

  assert.match(
    content,
    /userPreferences/i,
    "Preferences page should load user preferences"
  );

  assert.match(
    content,
    /mock_user_session/i,
    "Preferences must use logged-in user's session"
  );
});

test("Favorites.tsx ties favorites to logged-in user", () => {
  const content = read(FAVORITES);

  assert.match(
    content,
    /users.*find/i,
    "Favorites must look up current user from users[]"
  );

  assert.match(
    content,
    /user\.favorites/i,
    "Favorites must map user.favorites"
  );
});

test("Favorites.tsx saves updates for specific user", () => {
  const content = read(FAVORITES);

  assert.match(
    content,
    /saveUser/,
    "Favorites must save updates back to user record"
  );
});
