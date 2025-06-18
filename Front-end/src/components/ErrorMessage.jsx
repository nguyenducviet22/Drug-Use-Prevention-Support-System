import React from "react"
import { Alert } from "react-bootstrap"

const ErrorMessage = ({ error, fallback = "Something went wrong" }) => {
  if (!error) return null

  const message = typeof error === "string"
    ? error
    : error?.message || fallback

  return (
    <Alert variant="danger" className="text-center">
      {message}
    </Alert>
  )
}

export default ErrorMessage
