import React from "react";
import { Container } from "react-bootstrap";

const HeaderSection = ({ children, t }) => {
  return (
    <section
      className="position-relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #6366f1 100%)",
        minHeight: "600px",
      }}
    >
      <div
        className="position-absolute w-100 h-100"
        style={{
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
            '<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="#ffffff" fill-opacity="0.05"><circle cx="30" cy="30" r="2"/></g></g></svg>'
          )}")`,
          backgroundRepeat: "repeat",
          opacity: 0.3,
        }}
      ></div>
      <Container
        fluid
        style={{ maxWidth: "1400px", position: "relative", zIndex: 10 }}
        className="py-5"
      >
        <div className="text-center mb-5">
          <h1 className="display-1 fw-bold text-white mb-4">
            {t ? t("Create Your Event") : "Create Your Event"}
          </h1>
          <p
            className="fs-4 text-white-50 mx-auto"
            style={{ maxWidth: "600px" }}
          >
            {t
              ? t(
                  "Bring your vision to life with our intuitive event creation platform"
                )
              : "Bring your vision to life with our intuitive event creation platform"}
          </p>
        </div>
        {children}
      </Container>
    </section>
  );
};

export default HeaderSection;
