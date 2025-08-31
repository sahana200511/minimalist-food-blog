import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to validate JWT token
  const validateToken = (token) => {
    if (!token) return false;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      const payload = JSON.parse(atob(parts[1]));
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  };

  // Load token from localStorage on startup and validate it
  useEffect(() => {
    console.log("🔍 AuthContext: Loading token from localStorage...");
    const storedToken = localStorage.getItem("authToken");
    console.log("🔍 AuthContext: Stored token exists:", !!storedToken);

    if (storedToken) {
      console.log("🔍 AuthContext: Validating token...");
      const isValid = validateToken(storedToken);
      console.log("🔍 AuthContext: Token is valid:", isValid);

      if (isValid) {
        console.log("✅ AuthContext: Setting valid token to state");
        setToken(storedToken);
      } else {
        console.log("❌ AuthContext: Token is invalid, clearing from localStorage");
        localStorage.removeItem("authToken");
        setToken(null);
      }
    } else {
      console.log("ℹ️ AuthContext: No token found in localStorage");
      setToken(null);
    }

    // Mark loading as complete
    setIsLoading(false);
    console.log("🔄 AuthContext: Token loading complete");
  }, []);

  const login = (newToken) => {
    console.log("🔐 AuthContext: Login called with token:", !!newToken);
    setToken(newToken);
    localStorage.setItem("authToken", newToken);
    console.log("💾 AuthContext: Token stored in localStorage");
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("authToken");
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
