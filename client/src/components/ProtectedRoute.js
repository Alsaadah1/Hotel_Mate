// client/src/components/ProtectedRoute.jsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, role }) => {
  const user = useSelector((state) => state.users.user);

  // Not logged in at all
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If a role was specified, enforce it
  if (role) {
    // Owner routes: allow both owner AND staff
    if (role === "owner") {
      if (user.role !== "owner" && user.role !== "staff") {
        return <Navigate to="/" replace />;
      }
    }
    // Customer routes: only customer
    else if (role === "customer") {
      if (user.role !== "customer") {
        return <Navigate to="/" replace />;
      }
    }
    // Any other role (future-proof)
    else if (user.role !== role) {
      return <Navigate to="/" replace />;
    }
  }

  // All good
  return children;
};

export default ProtectedRoute;
