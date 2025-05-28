import { jwtDecode } from 'jwt-decode';
import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'

export default function OAuth2RedirectHandler() {

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        if (token) {
            localStorage.setItem("accessToken", token);
            const decodedToken = jwtDecode(token);
            localStorage.setItem("username", decodedToken?.sub);
            navigate("/");
        } else {
            console.error("No access token found in the URL!");
            navigate("/login?error=oauth2");
        }
    }, [location, navigate]);

    return <p>Redirecting...</p>;
}
