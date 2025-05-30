import React, { useState } from 'react'
import { useNavigate } from 'react-router';
import useLogin from '../hooks/useLogin';

export default function Login() {

    const { login, isAuthenticated, isLoading, error } = useLogin();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(username, password);
    }

    if (isAuthenticated) {
        return <p>Login Successfully</p>
    }

    if (isLoading) {
        return <p>Loading...</p>
    }

    return (
        <div className="login-form">
            <h2>Login</h2>
            <button onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}>
                Đăng nhập bằng Google
            </button>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <button type="submit">Login</button>
            </form>
        </div>
    )
}
