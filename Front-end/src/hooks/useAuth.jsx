import { useState, useEffect, useCallback } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
            const loginAccount = await fetchUser();
            const { role } = loginAccount
            if (role === null) navigate("/profile");
            if (role === "MEMBER") navigate("/");
            if (role === "STAFF") navigate("/staff");
            if (role === "MANAGER") navigate("/manager");
            if (role === "CONSULTANT") navigate("/consultant");
            if (role === "ADMIN") navigate("/admin/dashboard");
            toast.success("Login successfully")
        } catch (error) {
            console.error("Error during login:", error);
            if (error.response) {
                setError(error.response.data.message || "Login failed.");
            } else if (error.request) {
                setError("No response from server.");
            } else {
                setError("Unexpected error occurred.");
            }
            console.error("Error during login:", error);
            toast.error(error.response.data.message)
        } finally {
            setAuthLoading(false);
        }
    };

    const register = async (username, password, confirm) => {

        try {
            await API.post("api/user", { username, password, confirm });
            await login(username, password);
        } catch (error) {
            if (error.response) {
                setError(error.response.data.message || "Login failed.");
            }
            console.error("Error during register:", error);
            toast.error(error.response.data.message)
        }
    };

    const logout = () => {
        localStorage.clear();
        toast.success("Logout successfully")
        navigate("/");
        setUser(null);
    };

    const fetchUser = useCallback(async () => {
        try {
            const res = await API.get("/api/user/my-info");
            setUser(res.data.data);
            return res.data.data;
        } catch (error) {
            console.error("Auth error:", error);
            logout();
            return null;
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
        fetchUser
    };
};
