import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import './App.css'
import Signup from "./pages/SignUp";
import Login from "./pages/login";
import DataViewer from "./pages/Visualisation";
import ToastManager from "./Features/toastManager.jsx";
function App() {
  return (
    <BrowserRouter>
      <ToastManager/>
      <Routes>
        <Route path="/signUp" element={<Signup />} />
        <Route path="/visualisation" element={<DataViewer />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
