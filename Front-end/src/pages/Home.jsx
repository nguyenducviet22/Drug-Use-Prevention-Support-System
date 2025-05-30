import React from 'react'

export default function Home() {
  const username = localStorage.getItem("username");
  return (
    <div>Welcome, {username}</div>
  )
}