import { Container } from "react-bootstrap"

const LoadingSpinner = ({ loading, message = "Loading..." }) => {
  if (!loading) return null

  return (
    <Container className="text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">{message}</span>
      </div>
      <div className="mt-3 text-muted">{message}</div>
    </Container>
  )
}

export default LoadingSpinner
