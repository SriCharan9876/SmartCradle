import { createContext, useContext, useState, useEffect, useRef } from "react";
import { apiFetch } from "../services/api";
import { io } from "socket.io-client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!token || !user) return;

        const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
            withCredentials: true,
            auth: { userId: user.id }
        });

        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("Socket connected");
        });

        newSocket.on("disconnect", () => {
            console.log("Socket disconnected");
        });

        return () => {
            newSocket.disconnect();
        };
    }, [token, user]);

    const fetchUser = async () => {
        try {
            const userData = await apiFetch("/api/auth/me");
            setUser(userData);
        } catch (err) {
            console.error("Failed to fetch user:", err);
            localStorage.removeItem("token");
        } finally {
            setLoading(false);
        }
    };

    const login = (token) => {
        setLoading(true);
        localStorage.setItem("token", token);
        fetchUser();
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, fetchUser, socket }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
