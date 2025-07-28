import React from "react";
import { Card, Form } from "react-bootstrap";
import { ImageIcon } from "lucide-react";

const ImageUpload = ({ imagePreview, handleFileChange, t }) => {
  return (
    <Card className="border-0 shadow">
      <Card.Body className="p-0">
        <div
          className="position-relative d-flex align-items-center justify-content-center border-2 border-dashed rounded overflow-hidden"
          style={{
            height: "320px",
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            borderColor: "#dee2e6",
            cursor: "pointer",
          }}
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Event Preview"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "inherit",
              }}
            />
          ) : (
            <div className="text-center">
              <div
                className="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "64px",
                  height: "64px",
                  backgroundColor: "#dbeafe",
                }}
              >
                <ImageIcon size={32} className="text-primary" />
              </div>
              <p className="fs-5 fw-semibold text-dark mb-2">
                {t("Upload Event Image")}
              </p>
              <p className="text-muted small">
                {t("Drag and drop or click to browse")}
              </p>
            </div>
          )}
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: 0,
              cursor: "pointer",
              zIndex: 1,
            }}
          />
        </div>
      </Card.Body>
    </Card>
  );
};

export default ImageUpload;
