// src/Tests/Login.test.jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import "@testing-library/jest-dom";
import { store } from "../Store/Store";
import Login from "../pages/Login.jsx";

describe("Login Page UI Tests", () => {
  const renderWithProviders = () =>
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );

  it("renders the main title 'Hotel Mate'", () => {
    renderWithProviders();
    const title = screen.getByRole("heading", { level: 1 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent(/hotel mate/i);
  });

  it("renders the email input field", () => {
    renderWithProviders();
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("type", "email");
  });

  it("renders the password input field", () => {
    renderWithProviders();
    // Only match the <input>, not the 👁 button with aria-label="Show password"
    const passwordInput = screen.getByLabelText(/password/i, {
      selector: "input",
    });
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("renders the 'Sign in' button", () => {
    renderWithProviders();
    const button = screen.getByRole("button", { name: /sign in/i });
    expect(button).toBeInTheDocument();
  });

  it("renders the 'New guest? Create an account' helper text", () => {
    renderWithProviders();
    const registerText = screen.getByText(/new guest\?\s*create an account/i);
    expect(registerText).toBeInTheDocument();
  });
});
