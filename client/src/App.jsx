import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Cradle from "./pages/Cradle";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";

function Private({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<Private><Layout><Dashboard /></Layout></Private>} />
          <Route path="/cradle/:id" element={<Private><Layout><Cradle /></Layout></Private>} />
          <Route path="/cradle/:id/history" element={<Private><Layout><History /></Layout></Private>} />
          <Route path="/cradle/:id/analytics" element={<Private><Layout><Analytics /></Layout></Private>} />
          <Route path="/profile" element={<Private><Layout><Profile /></Layout></Private>} />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
