import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router';

export default function MyInfo() {
  const { username } = useParams();
  const API_USER_DETAILS_URL = `http://localhost:8080/api/user/${username}`;
  const [user, setUser] = useState({});

  useEffect(() => {
    const fetchUserInfo = () => {
      fetch(API_USER_DETAILS_URL,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      )
        .then((res) => res.json())
        .then((data) => setUser(data));
    }
    fetchUserInfo();
  }, []);

  return (
    <>
      <h2>My Information</h2>
      <table>
        <tbody>
          <tr>
            <td>Username:</td>
            <td>{user.username}</td>
          </tr>
          <tr>
            <td>Email:</td>
            <td>{user.email}</td>
          </tr>
          <tr>
            <td>Full Name:</td>
            <td>{user.fullName}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
