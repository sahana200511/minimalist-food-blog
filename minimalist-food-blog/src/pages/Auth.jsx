// src/pages/Auth.jsx
import React, { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";

export default function Auth() {
  const [showLogin, setShowLogin] = useState(true); // default to login page

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(/assets/sushi.jpg)` }} // public folder reference
    >
      {/* Black shadow overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Content container */}
      <div className="relative z-10 w-full max-w-md rounded-lg shadow-md bg-black bg-opacity-40 p-6 border border-gray-200">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold font-serif mb-2 text-white">
            Food Blog
          </h1>
          <p className="text-white text-lg">
            {showLogin ? "Welcome back!" : "Create your account"}
          </p>
        </div>

        <div>
          {showLogin ? (
            <>
              <Login onLoginSuccess={() => {}} />
              <div className="mt-6 text-center">
                <span className="text-gray-200">New here? </span>
                <button
                  className="text-blue-300 hover:underline font-medium"
                  onClick={() => setShowLogin(false)}
                >
                  Sign Up
                </button>
              </div>
            </>
          ) : (
            <>
              <Signup onSignupSuccess={() => setShowLogin(true)} />
              <div className="mt-6 text-center">
                <span className="text-gray-200">Already registered? </span>
                <button
                  className="text-blue-300 hover:underline font-medium"
                  onClick={() => setShowLogin(true)}
                >
                  Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
