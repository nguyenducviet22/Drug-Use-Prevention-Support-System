import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const StatsCard = ({
  title,
  value,
  icon,
  subtitle,
  variant = "primary",
  trend,
  trendType,
}) => {
  return (
    <Card className={`stats-card stats-card-${variant}`}>
      <Card.Body>
        <Row className="align-items-center">
          <Col xs={8}>
            <div className="stats-content">
              <div className="stats-number">
                {Number(value || 0).toLocaleString()}
              </div>
              <div className="stats-label">{title}</div>
              {subtitle && <div className="stats-subtitle">{subtitle}</div>}
              {trend && (
                <div className={`stats-trend trend-${trendType}`}>
                  {trendType === "positive" ? <FaArrowUp /> : <FaArrowDown />}
                  <span className="trend-value">{trend}</span>
                  <span className="trend-period">vs last month</span>
                </div>
              )}
            </div>
          </Col>
          <Col xs={4} className="text-end">
            <div className={`stats-icon stats-icon-${variant}`}>{icon}</div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default StatsCard;
