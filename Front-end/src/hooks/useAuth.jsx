import { useState, useEffect, useCallback } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const login = async (username, password) => {
        setAuthLoading(true);
        setError(null);
        try {
            const response = await API.post("/auth/login", { username, password });
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("username", username);
            await fetchUser();
            navigate("/");
        } catch (error) {
            if (error.response) {
                setError(error.response.data.message || "Login failed.");
            } else if (error.request) {
                setError("No response from server.");
            } else {
                setError("Unexpected error occurred.");
            }
            console.error("Error during login:", error);
        } finally {
            setAuthLoading(false);
        }
    };

    const register = async (username, password, confirm) => {
        await API.post("api/user", { username, password, confirm });
        await login(username, password);
    };

    const logout = () => {
        // localStorage.removeItem("token");
        localStorage.clear();
        navigate("/");
        setUser(null);
    };

    const fetchUser = useCallback(async () => {
        try {
            const username = localStorage.getItem("username");
            const res = await API.get(`/api/user/${username}`);
            setUser(res.data);
        } catch (err) {
            console.error("Auth error:", err);
            logout();
        } finally {
            setAuthLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetchUser();
        } else {
            setAuthLoading(false);
        }
    }, [fetchUser]);

    return {
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        authLoading,
        error,
    };
};
