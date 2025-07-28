import React from "react";
import { Button } from "react-bootstrap";

const ActionButtons = ({ handleSaveAsDraft, handlePublishEvent, previewData, navigate, t }) => {
  return (
    <div className="d-flex flex-wrap gap-3 justify-content-center">
      <Button
        variant="light"
        className="px-4 fw-semibold"
        style={{ borderRadius: "12px" }}
        onClick={handleSaveAsDraft}
      >
        {t("Save as Draft")}
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
        onClick={handlePublishEvent}
      >
        {t("Publish Event")}
      </Button>
    </div>
  );
};

export default ActionButtons;