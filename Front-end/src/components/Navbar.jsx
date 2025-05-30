import React from 'react'
import { Link, useNavigate } from 'react-router'
import useLogin from '../hooks/useLogin';

export default function Navbar() {

  const { logout, isAuthenticated } = useLogin();
  const username = localStorage.getItem("username");
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  }

  return (
    <ul>
      <Link to={'/'}><li>Home</li></Link>
      {isAuthenticated ?
        (
          <>
            <Link to={`/user/${username}`}>My Info</Link><br />
            <button onClick={handleLogout}>Logout</button>
          </>
        )
        : <Link to={'/login'}><li>Login</li></Link>
      }
    </ul>
  )
}
