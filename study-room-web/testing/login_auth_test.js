import { test } from "node:test";
import assert from "assert";
import fs from "fs";
import path from "path";

const loginPath = path.resolve("src/components/Login/MockLogin.tsx");

function read(file) {
  assert.ok(fs.existsSync(file), `${file} must exist`);
  return fs.readFileSync(file, "utf-8");
}

test("Login page exists", () => {
  assert.ok(fs.existsSync(loginPath), "MockLogin.tsx must exist");
});

test("Login page contains username/email input", () => {
  const content = read(loginPath);
  assert.match(
    content,
    /<input[^>]+type=["']email["']/i,
    "MockLogin must contain an email/username <input>"
  );
});

test("Login page contains password input (if implemented)", () => {
  const content = read(loginPath);
  assert.match(
    content,
    /<input[^>]+type=["']password["']/i,
    "MockLogin must contain a password <input>"
  );
});

test("Login page contains login button", () => {
  const content = read(loginPath);
  assert.match(
    content,
    /<button[^>]*>.*login.*<\/button>/i,
    "MockLogin must contain a login button"
  );
});

test("Login page writes mock_user_session to localStorage", () => {
  const content = read(loginPath);
  assert.match(
    content,
    /localStorage\.setItem\s*\(\s*["']mock_user_session["']/,
    "MockLogin must write mock_user_session to localStorage"
  );
});
