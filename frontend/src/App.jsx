// frontend/src/App.jsx
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();

  // Log online users for debugging
  useEffect(() => {
    console.log("Online Users:", onlineUsers);
  }, [onlineUsers]);

  // Run auth check once on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Log auth user for debugging
  useEffect(() => {
    console.log("Auth User:", authUser);
  }, [authUser]);

  // Show loader while checking auth
  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>

      <Toaster position="top-right" />
    </div>
  );
};

export default App;
