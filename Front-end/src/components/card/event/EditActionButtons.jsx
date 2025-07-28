import React from "react";
import { Button } from "react-bootstrap";

const EditActionButtons = ({ handleSaveChanges, handleSubmitEvent, previewData, navigate, t }) => {
  return (
    <div className="d-flex flex-wrap gap-3 justify-content-center">
      <Button
        variant="light"
        className="px-4 fw-semibold"
        style={{ borderRadius: "12px" }}
        onClick={handleSaveChanges}
      >
        {t("Save Changes")}
      </Button>
      <Button
        variant="primary"
        className="px-4 fw-semibold"
        style={{ borderRadius: "12px" }}
        onClick={() => {
          console.log("Preview Data:", previewData);
          navigate("/events/preview", { state: previewData });
        }}
      >
        {t("Preview Event")}
      </Button>
      <Button
        variant="success"
        className="px-4 fw-semibold"
        style={{ borderRadius: "12px" }}
        onClick={handleSubmitEvent}
      >
        {t("Submit Event")}
      </Button>
    </div>
  );
};

export default EditActionButtons;