// src/Tests/Register.test.jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Register from "../pages/Register.jsx";

describe("Register Component", () => {
  const renderWithRouter = (ui) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  it("should render the main title", () => {
    renderWithRouter(<Register />);

    const title = screen.getByRole("heading", {
      name: /create your guest account/i,
    });

    expect(title).toBeInTheDocument();
  });

  it("should have email input", () => {
    renderWithRouter(<Register />);

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeInTheDocument();
  });

  it("should have full name input", () => {
    renderWithRouter(<Register />);

    const nameInput = screen.getByLabelText(/full name/i);
    expect(nameInput).toBeInTheDocument();
  });

  it("should have password and confirm password inputs", () => {
    renderWithRouter(<Register />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    expect(passwordInput).toBeInTheDocument();

    // 🔧 Make this exact so it doesn't match "Show confirm password"
    const confirmPasswordInput = screen.getByLabelText(
      /^confirm password$/i
    );
    expect(confirmPasswordInput).toBeInTheDocument();
  });

  it("should have register button", () => {
    renderWithRouter(<Register />);

    const registerButton = screen.getByRole("button", {
      name: /create account/i,
    });
    expect(registerButton).toBeInTheDocument();
  });
});
