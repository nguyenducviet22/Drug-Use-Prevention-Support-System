import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useTranslation } from "react-i18next";

const EventContentSection = ({ title, icon, gradient, value, onChange }) => {
  const { t, i18n } = useTranslation("createEventPage");
  const [language, setLanguage] = useState(i18n.language);

  // Cập nhật state khi ngôn ngữ thay đổi
  useEffect(() => {
    setLanguage(i18n.language);
    console.log("Language changed to:", i18n.language); // Debug
  }, [i18n.language]);

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["link", "image"],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "color",
    "background",
    "align",
  ];

  // Xác định placeholder dựa trên title đã dịch
  const getPlaceholder = () => {
    const translatedTitle = t(title);
    switch (translatedTitle) {
      case t("introduction"):
        return t("Provide a general introduction to your event...");
      case t("details"):
        return t("Provide more in-depth details about your event, such as agenda, speakers, etc.");
      default:
        return "";
    }
  };

  return (
    <Card className="border-0 shadow">
      <Card.Body className="p-4">
        <div className="d-flex align-items-center mb-4">
          <div
            className="me-3 rounded d-flex align-items-center justify-content-center"
            style={{
              width: "32px",
              height: "32px",
              background: gradient,
            }}
          >
            <span>{icon}</span>
          </div>
          <h2 className="fs-3 fw-bold text-dark mb-0">{t(title)}</h2>
        </div>
        <div
          className="bg-light rounded border"
          style={{ minHeight: "250px" }}
        >
          <ReactQuill
            key={language} // Ép re-render ReactQuill khi ngôn ngữ thay đổi
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            formats={formats}
            placeholder={getPlaceholder()}
            style={{ height: "206px" }}
            className="border-0 bg-transparent"
          />
        </div>
      </Card.Body>
    </Card>
  );
};

export default EventContentSection;