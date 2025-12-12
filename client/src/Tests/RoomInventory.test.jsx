// src/Tests/RoomInventory.test.jsx
import React from "react";
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  vi,
} from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/jest-dom";

import RoomInventory from "../pages/RoomInventory.jsx";
import userReducer from "../Store/usersSlice";

// ✅ Mock Navbar so it doesn't affect layout or queries
vi.mock("../components/Navbar", () => ({
  default: () => <nav data-testid="mock-navbar" />,
}));

// ----------------------
// Global setup
// ----------------------
beforeAll(() => {
  process.env.REACT_APP_SERVER_URL = "http://localhost:5000";

  // Silence console.error spam from fetch during tests
  vi.spyOn(console, "error").mockImplementation(() => {});
});

// Default fetch mock — empty rooms list unless overridden
beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]), // empty room list
    })
  );
});

// ----------------------
// Store helpers
// ----------------------
const makeOwnerStore = () =>
  configureStore({
    reducer: { users: userReducer },
    preloadedState: {
      users: {
        user: { role: "owner", _id: "test-manager-id", name: "Test Owner" },
      },
    },
  });

const makeCustomerStore = () =>
  configureStore({
    reducer: { users: userReducer },
    preloadedState: {
      users: {
        user: { role: "customer", _id: "test-customer-id", name: "Guest User" },
      },
    },
  });

const renderWithStore = (ui, store) =>
  render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  );

// ----------------------
// TEST SUITE
// ----------------------
describe("RoomInventory Component", () => {
  it("renders heading 'Room Inventory' for manager (owner) user", () => {
    renderWithStore(<RoomInventory />, makeOwnerStore());

    expect(
      screen.getByRole("heading", { name: /room inventory/i })
    ).toBeInTheDocument();
  });

  it("shows 'Add new room' button", () => {
    renderWithStore(<RoomInventory />, makeOwnerStore());

    expect(
      screen.getByRole("button", { name: /add new room/i })
    ).toBeInTheDocument();
  });

  it("shows empty state message when there are no rooms", async () => {
    // default fetch -> []
    renderWithStore(<RoomInventory />, makeOwnerStore());

    // Main empty-state title
    expect(
      await screen.findByText(/no rooms in inventory yet/i)
    ).toBeInTheDocument();

    // Second line: composed with <strong>“Add new room”</strong>
    const lines = screen.getAllByText((content, node) => {
      if (!node || node.tagName.toLowerCase() !== "p") return false;
      const text = node.textContent?.toLowerCase() || "";
      return (
        text.includes("click") &&
        text.includes("add new room") &&
        text.includes("first listing")
      );
    });

    expect(lines.length).toBeGreaterThan(0);
  });

  it("renders table headings and a room row when rooms exist", async () => {
    // Override fetch for this test: return one room
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              _id: "room-1",
              title: "Deluxe King Room",
              nightlyRate: 45,
              summary: "King bed, city view, breakfast included",
              photo: "room1.jpg",
            },
          ]),
      })
    );

    renderWithStore(<RoomInventory />, makeOwnerStore());

    // Table headings (use columnheader role to avoid multiple /room/i matches)
    const roomHeader = await screen.findByRole("columnheader", {
      name: /^room$/i,
    });
    expect(roomHeader).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", {
        name: /rate \(omr \/ night\)/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", {
        name: /highlights/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", {
        name: /actions/i,
      })
    ).toBeInTheDocument();

    // Room title
    expect(screen.getByText(/deluxe king room/i)).toBeInTheDocument();

    // Price chip text like "45 OMR"
    expect(screen.getByText(/45\s*omr/i)).toBeInTheDocument();

    // Actions
    expect(
      screen.getByRole("button", { name: /edit/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /delete/i })
    ).toBeInTheDocument();
  });

  it("shows 'Manager access required' notice when user is not owner", () => {
    renderWithStore(<RoomInventory />, makeCustomerStore());

    // Match the actual heading: "Manager or staff access required"
    expect(
      screen.getByRole("heading", {
        name: /manager or staff access required/i,
      })
    ).toBeInTheDocument();

    // Match the body text including 'and staff'
    expect(
      screen.getByText(
        /the room inventory is only available for hotel managers and staff/i
      )
    ).toBeInTheDocument();
  });
});
