import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token, isLoading } = useAuth();
  console.log("🔒 ProtectedRoute: Checking token:", !!token, "Loading:", isLoading);

  // Show loading state while AuthContext is initializing
  if (isLoading) {
    console.log("⏳ ProtectedRoute: AuthContext still loading, waiting...");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    console.log("🚫 ProtectedRoute: No token found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("✅ ProtectedRoute: Token found, allowing access");
  return children;
}
