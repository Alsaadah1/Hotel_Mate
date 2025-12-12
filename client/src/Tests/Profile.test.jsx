// src/Tests/Profile.test.jsx
import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// ✅ Mock Navbar so it doesn't require router/redux
vi.mock("../components/Navbar", () => ({
  default: () => <nav data-testid="mock-navbar" />,
}));

// ✅ Mock SweetAlert2 so network/UI popups don't break tests
vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: false }),
  },
}));

// ✅ Import your actual Profile component (.js file)
import Profile from "../pages/Profile";

// helper: render with a logged-in user in localStorage
const renderWithUser = () => {
  const fakeUser = {
    _id: "u1",
    name: "Test User",
    email: "test@example.com",
    role: "customer",
  };

  // Seed localStorage exactly how your app expects
  window.localStorage.setItem("user", JSON.stringify(fakeUser));

  return render(<Profile />);
};

describe("Profile Component", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("renders the Profile heading", () => {
    renderWithUser();

    const heading = screen.getByRole("heading", { name: /your profile/i });
    expect(heading).toBeInTheDocument();
  });

  it("shows the user's name in the input field", () => {
    renderWithUser();

    const nameInput = screen.getByDisplayValue(/test user/i);
    expect(nameInput).toBeInTheDocument();
  });

  it("renders Save changes button", () => {
    renderWithUser();

    const saveButton = screen.getByRole("button", { name: /save changes/i });
    expect(saveButton).toBeInTheDocument();
  });

  it("renders password change inputs after clicking Password tab", () => {
    renderWithUser();

    // First click Password tab to show that pane
    const passwordTabBtn = screen.getByRole("button", { name: /password/i });
    fireEvent.click(passwordTabBtn);

    // Now these exist (from your component)
    const oldPasswordInput = screen.getByPlaceholderText(/current password/i);

    // 👇 use exact text, so we don't also match "Repeat new password"
    const newPasswordInput = screen.getByPlaceholderText("New password");

    const confirmPasswordInput = screen.getByPlaceholderText(
      /repeat new password/i
    );

    expect(oldPasswordInput).toBeInTheDocument();
    expect(newPasswordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();
  });

  it("renders Update password button in password tab", () => {
    renderWithUser();

    // Activate the Password tab
    const passwordTabBtn = screen.getByRole("button", { name: /password/i });
    fireEvent.click(passwordTabBtn);

    const updatePasswordButton = screen.getByRole("button", {
      name: /update password/i,
    });
    expect(updatePasswordButton).toBeInTheDocument();
  });
});
