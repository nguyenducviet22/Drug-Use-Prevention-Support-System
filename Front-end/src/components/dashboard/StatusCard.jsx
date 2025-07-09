import React from 'react';
import { Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const StatusCard = ({ title, value, change, icon: Icon, gradientClass }) => {
  const { t } = useTranslation("statusCard"); // Use the new namespace

  return (
    <Card className="status-card h-100">
      <Card.Body className="d-flex align-items-center justify-content-between">
        <div className="flex-grow-1">
          <p className="text-muted mb-1 small fw-medium">{title}</p>
          <h4 className="fw-bold text-dark mb-1">{value}</h4>
          {change && (
            <div className="d-flex align-items-center">
              <span className={`badge ${change > 0 ? 'bg-success' : 'bg-danger'} d-flex align-items-center`}>
                <span className="me-1">{change > 0 ? t('increase') : t('decrease')}</span>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <div className={`${gradientClass} p-3 rounded-3 text-white`}>
          <Icon size={20} />
        </div>
      </Card.Body>
    </Card>
  );
};

export default StatusCard;