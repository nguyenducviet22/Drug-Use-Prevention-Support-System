import React from 'react';
import { Card } from 'react-bootstrap';
import { BarChart3, PieChart, TrendingUp, Activity, Users, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const AnalyticsPreview = () => {
  const { t } = useTranslation("analyticsPreview"); // Use the new namespace

  return (
    <Card className="pending-card h-100">
      <Card.Body>
        <div className="d-flex align-items-center mb-4">
          <div className="icon-gradient-success p-3 rounded-3 text-white me-3">
            <BarChart3 size={24} />
          </div>
          <h5 className="fw-bold text-dark mb-0">{t('analyticsReports')}</h5>
        </div>
        <p className="text-muted mb-4">{t('generateReportsDescription')}</p>

        {/* Preview of available reports */}
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between p-2 rounded mb-2 bg-light">
            <span className="small fw-medium text-dark">• {t('userEngagementReport')}</span>
            <PieChart size={16} className="text-muted" />
          </div>
          <div className="d-flex align-items-center justify-content-between p-2 rounded mb-2 bg-light">
            <span className="small fw-medium text-dark">• {t('courseCompletionAnalytics')}</span>
            <BarChart3 size={16} className="text-muted" />
          </div>
          <div className="d-flex align-items-center justify-content-between p-2 rounded mb-2 bg-light">
            <span className="small fw-medium text-dark">• {t('consultationSuccessMetrics')}</span>
            <TrendingUp size={16} className="text-muted" />
          </div>
          <div className="d-flex align-items-center justify-content-between p-2 rounded mb-2 bg-light">
            <span className="small fw-medium text-dark">• {t('riskAssessmentTrends')}</span>
            <Activity size={16} className="text-muted" />
          </div>
          <div className="d-flex align-items-center justify-content-between p-2 rounded bg-light">
            <span className="small fw-medium text-dark">• {t('communityProgramImpact')}</span>
            <Users size={16} className="text-muted" />
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-end">
          <div className="d-flex align-items-center text-primary fw-semibold">
            {t('generate')} <ChevronRight size={16} className="ms-1" />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AnalyticsPreview;