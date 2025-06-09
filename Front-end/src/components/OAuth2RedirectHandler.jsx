import { jwtDecode } from 'jwt-decode';
import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext';

export default function OAuth2RedirectHandler() {

    const navigate = useNavigate();
    const location = useLocation();
    const { fetchUser } = useAuthContext() || {};

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        if (token) {
            localStorage.setItem("token", token);
            const decodedToken = jwtDecode(token);
            localStorage.setItem("username", decodedToken?.sub);
            if (fetchUser) {
                fetchUser();
            }
            navigate("/");
        } else {
            console.error("No access token found in the URL!");
            navigate("/login?error=oauth2");
        }
    }, [location, navigate, fetchUser]);

    return <p>Redirecting...</p>;
}
