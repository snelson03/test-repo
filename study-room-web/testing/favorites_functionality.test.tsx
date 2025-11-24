import { test } from "node:test";
import assert from "assert";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

import Favorites from "../src/pages/Favorites/Favorites";

function resetMockStorage() {
    localStorage.clear();
}

test("Favorites.tsx defines required structure", () => {
    assert.ok(Favorites, "Favorites component should exist");
});

test("Initializes default favorites when none exist", () => {
    resetMockStorage();

    localStorage.setItem("users", JSON.stringify([
        { email: "test@test.com", favorites: null }
    ]));

    localStorage.setItem("mock_user_session", JSON.stringify({
        email: "test@test.com"
    }));

    render(<Favorites />);

    const users = JSON.parse(localStorage.getItem("users"));
    const user = users[0];

    assert.ok(Array.isArray(user.favorites), "User favorites should be initialized");
    assert.ok(user.favorites.length > 0, "Default favorites should be populated");
});


test("Toggling edit mode", () => {
    resetMockStorage();

    localStorage.setItem("users", JSON.stringify([
        {
            email: "test@test.com",
            favorites: [
                { id: 1, building_name: "Stocker Center", floor: "1F", status: "available", number: 155 }
            ]
        }
    ]));

    localStorage.setItem("mock_user_session", JSON.stringify({
        email: "test@test.com"
    }));

    render(<Favorites />);

    const editBtn = screen.getByText(/edit/i);
    assert.ok(editBtn, "Edit button should exist");

    fireEvent.click(editBtn);

    const doneBtn = screen.getByText(/done/i);
    assert.ok(doneBtn, "Button should switch to Done when toggled");
});

test("Removing a favorite item updates LocalStorage", () => {
    resetMockStorage();

    const mockData = [
        {
            email: "test@test.com",
            favorites: [
                { id: 1, building_name: "Stocker Center", floor: "1F", status: "available", number: 155 }
            ]
        }
    ];

    localStorage.setItem("users", JSON.stringify(mockData));
    localStorage.setItem("mock_user_session", JSON.stringify({ email: "test@test.com" }));

    render(<Favorites />);

    fireEvent.click(screen.getByText(/edit/i));

    const removeBtn = screen.getByRole("button", { name: "✕" });
    fireEvent.click(removeBtn);

    const users = JSON.parse(localStorage.getItem("users"));
    const updatedUser = users[0];

    assert.equal(updatedUser.favorites.length, 0, "Favorite should be removed");
});

test("Room statuses are dynamically updated every interval", () => {
    resetMockStorage();

    jest.useFakeTimers();

    const mockData = [
        {
            email: "test@test.com",
            favorites: [
                { id: 1, building_name: "Stocker", floor: "1F", status: "available", number: 155 }
            ]
        }
    ];

    localStorage.setItem("users", JSON.stringify(mockData));
    localStorage.setItem("mock_user_session", JSON.stringify({ email: "test@test.com" }));

    render(<Favorites />);

    const before = JSON.parse(localStorage.getItem("users"))[0].favorites[0].status;

    jest.advanceTimersByTime(5000);

    const after = JSON.parse(localStorage.getItem("users"))[0].favorites[0].status;

    assert.notEqual(before, after, "Status should change after interval");
});
