import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { ArrowLeft } from "lucide-react";

const BackButton = ({ label = "Back" }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(-1);
  };

  return (
    <Button variant="primary" onClick={handleClick} className="d-flex align-items-center gap-2">
      <ArrowLeft size={16} />
      {label}
    </Button>
  );
};

export default BackButton;
