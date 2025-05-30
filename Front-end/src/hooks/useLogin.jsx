import { jwtDecode } from 'jwt-decode';
import React from 'react'
import { useState } from 'react';

export default function useLogin() {

    const API_LOGIN_URL = "http://localhost:8080/auth/login";

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!localStorage.getItem("accessToken");
    });

    const login = async (username, password) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(API_LOGIN_URL,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ username, password })
                }
            );
            if (!res.ok) {
                const errData = await res.json();
                console.error("Login failed: ", errData);
                setError("Login failed! Please check you credentials!");
                setIsLoading(false);
                return;
            }
            const data = await res.json();
            const { token } = data;
            localStorage.setItem("accessToken", token);
            const decodedToken = jwtDecode(token);
            localStorage.setItem("username", decodedToken?.sub);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Error during login: ", error);
            setError("Incorrect username or password!");
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    }

    const logout = () => {
        localStorage.clear();
        setIsAuthenticated(false);
    }

    return {
        isLoading,
        error,
        isAuthenticated,
        login,
        logout
    };
}
