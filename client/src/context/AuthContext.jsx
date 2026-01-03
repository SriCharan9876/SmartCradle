import { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

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
        localStorage.setItem("token", token);
        fetchUser();
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
