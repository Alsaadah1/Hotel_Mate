// src/App.js

import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";

import BookingCart from "./pages/BookingCart";
import CustomerReservations from "./pages/CustomerReservations";
import ManagementOverview from "./pages/ManagementOverview";
import ProtectedRoute from "./components/ProtectedRoute";
import RoomInventory from "./pages/RoomInventory";
import BookingRequests from "./pages/BookingRequests";
import FinanceReport from "./pages/FinanceReport";
import Profile from "./pages/Profile";
import UserManagement from "./pages/UserManagement"; 
import Aboutus from "./pages/Aboutus"; 
import MainHome from "./pages/MainHome";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes (Hotel Mate: Login + Customer Registration) */}
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about-us" element={<Aboutus />} />
        <Route path="/" element={<MainHome />} />

        {/* Customer Routes (Hotel Mate: Customer dashboard + bookings) */}
        <Route
          path="/home"
          element={
            <ProtectedRoute role="customer">
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking-cart"
          element={
            <ProtectedRoute role="customer">
              <BookingCart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reservations"
          element={
            <ProtectedRoute role="customer">
              <CustomerReservations />
            </ProtectedRoute>
          }
        />

        {/* Admin/Owner Routes
           Hotel Mate: we will treat "owner" as "admin" initially */}
        <Route
          path="/management-overview"
          element={
            <ProtectedRoute role="owner">
              <ManagementOverview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/room-inventory"
          element={
            <ProtectedRoute role="owner">
              <RoomInventory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking-requests"
          element={
            <ProtectedRoute role="owner">
              <BookingRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/finance-report"
          element={
            <ProtectedRoute role="owner">
              <FinanceReport />
            </ProtectedRoute>
          }
        />

        {/* 🔐 NEW: User Management – only admin/owner can access */}
        <Route
          path="/user-management"
          element={
            <ProtectedRoute role="owner">
              <UserManagement />
            </ProtectedRoute>
          }
        />

        {/* Profile – any logged-in user (customer or owner) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
