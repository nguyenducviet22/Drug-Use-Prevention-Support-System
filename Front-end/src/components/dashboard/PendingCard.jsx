import React from "react";
import { Card, Badge, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const PendingCard = ({
  title,
  type,
  count,
  items,
  onView,
  onApprove,
  onReject,
}) => {
  const { t } = useTranslation("pendingCard");

  // Validate UUID
  const isValidUUID = (str) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return typeof str === "string" && uuidRegex.test(str);
  };

  return (
    <Card className="pending-card h-100">
      <Card.Body>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h5 className="fw-bold text-dark mb-0">{title}</h5>
          <Badge bg="primary" className="fs-6 px-3 py-2">
            {t("pendingCount", { count: count })}
          </Badge>
        </div>

        <div className="mb-4">
          {items.length > 0 ? (
            items
              .map((item) => {
                // Extract ID based on item type
                const id = item.courseID || item.blogID || item.eventID;
                if (!id || !isValidUUID(id)) {
                  console.warn(`Invalid ID for item:`, item);
                  return null; // Skip items with invalid IDs
                }

                // Extract name based on item type
                const name =
                  item.courseName ||
                  item.blogName ||
                  item.eventName ||
                  item.title ||
                  t("noTitle");

                // Extract author based on item type
                const author =
                  item.member?.username ||
                  item.createdByStaff?.username ||
                  "Unknown Author";

                // Use updatedAt or fallback to 'recently'
                const submittedDate = item.updatedAt || t("recently");

                return (
                  <div key={id} className="p-3 mb-3 bg-light rounded-3 border">
                    <div className="d-flex align-items-start justify-content-between">
                      <div className="flex-grow-1 me-3">
                        <p className="fw-semibold text-dark mb-1 small">
                          {name}
                        </p>
                        <div className="d-flex align-items-center text-muted small">
                          <span className="fw-medium">
                            {t("by", { author })}
                          </span>
                          <span className="mx-2">•</span>
                          <span>{submittedDate}</span>
                        </div>
                      </div>
                      <div className="d-flex flex-column gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          className="btn-gradient-success"
                          onClick={() => onApprove && onApprove(id, type)}
                        >
                          {t("approve")}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          className="btn-gradient-danger"
                          onClick={() => onReject && onReject(id, type)}
                        >
                          {t("reject")}
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          className="btn-gradient-primary"
                          onClick={() => onView && onView(id, type)}
                        >
                          {t("view")}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
              .filter(Boolean) // Remove null entries from invalid items
          ) : (
            <p className="text-muted">
              {t("noItems", { defaultValue: "No items available" })}
            </p>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default PendingCard;
