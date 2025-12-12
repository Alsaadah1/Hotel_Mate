// src/Tests/BookingCart.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";

// ✅ Mock Navbar so it doesn't break tests
vi.mock("../components/Navbar", () => ({
  default: () => <div data-testid="mock-navbar" />,
}));

// ✅ Mock SweetAlert2 so dialogs don't actually run
vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: false }),
  },
}));

// IMPORTANT: default import (your page has `export default BookingCart`)
import BookingCart from "../pages/BookingCart.jsx";

const createStore = (cartItems = []) =>
  configureStore({
    reducer: {
      cart: (state = { cartItems }, _action) => state,
      users: (
        state = {
          user: { _id: "u1", name: "Test User", role: "customer" },
        },
        _action
      ) => state,
    },
  });

const renderWithStore = (cartItems = []) =>
  render(
    <Provider store={createStore(cartItems)}>
      <MemoryRouter>
        <BookingCart />
      </MemoryRouter>
    </Provider>
  );

describe("BookingCart Component", () => {
  it("renders the main booking heading 'Review your stay plan'", () => {
    renderWithStore([]);
    const heading = screen.getByRole("heading", {
      name: /review your stay plan/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it("shows empty state message when there are no rooms selected", () => {
    renderWithStore([]);

    // Empty-state texts
    expect(screen.getByText(/no rooms selected/i)).toBeInTheDocument();
    expect(
      screen.getByText(/browse available rooms and add them to your stay plan/i)
    ).toBeInTheDocument();

    // Right side reservation panel
    expect(screen.getByText(/reservation overview/i)).toBeInTheDocument();

    // Use anchored regex so only the span is matched, not "No rooms selected"
    const roomsSelectedLabel = screen.getByText(/^Rooms selected$/i);
    expect(roomsSelectedLabel).toBeInTheDocument();

    // Value "0" (rooms selected)
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("shows reservation overview panel and correct summary when there are items", () => {
    renderWithStore([
      {
        equipmentId: "eq1",
        name: "Deluxe King Room",
        rentalDuration: "3 Days",
        price: 10,
        image: "room1.jpg",
        ownerId: "owner1",
      },
    ]);

    expect(screen.getByText(/reservation overview/i)).toBeInTheDocument();

    const roomsSelectedLabel = screen.getByText(/^Rooms selected$/i);
    expect(roomsSelectedLabel).toBeInTheDocument();

    // 1 room selected
    expect(screen.getByText("1")).toBeInTheDocument();

    expect(screen.getByText(/room charges/i)).toBeInTheDocument();

    // There are two "Amount due at check-in" texts (band + summary).
    // Just assert that at least one exists using getAllByText.
    const amountDueNodes = screen.getAllByText(
      /^Amount due at check-in/i
    );
    expect(amountDueNodes.length).toBeGreaterThan(0);
  });

  it("renders a room item and shows its total price in OMR when cart has items", () => {
    renderWithStore([
      {
        equipmentId: "eq1",
        name: "Deluxe King Room",
        rentalDuration: "3 Days", // getDaysFromDuration => 3
        price: 10, // 10 * 3 = 30
        image: "room1.jpg",
        ownerId: "owner1",
      },
    ]);

    // Room title
    expect(screen.getByText(/deluxe king room/i)).toBeInTheDocument();

    // There are multiple "OMR 30.00" (band, item, possibly in modals),
    // so use getAllByText and just assert at least one.
    const omrNodes = screen.getAllByText(/omr\s*30\.00/i);
    expect(omrNodes.length).toBeGreaterThan(0);

    // "Review this room" button present
    expect(
      screen.getByRole("button", { name: /review this room/i })
    ).toBeInTheDocument();
  });
});
