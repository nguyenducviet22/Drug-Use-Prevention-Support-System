import React from 'react';
import { Card } from 'react-bootstrap';
import { BarChart3, PieChart, TrendingUp, Activity, Users, ChevronRight } from 'lucide-react';

const AnalyticsPreview = () => (
  <Card className="pending-card h-100">
    <Card.Body>
      <div className="d-flex align-items-center mb-4">
        <div className="icon-gradient-success p-3 rounded-3 text-white me-3">
          <BarChart3 size={24} />
        </div>
        <h5 className="fw-bold text-dark mb-0">Analytics Reports</h5>
      </div>
      <p className="text-muted mb-4">Generate comprehensive reports and insights</p>
      
      {/* Preview of available reports */}
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between p-2 rounded mb-2 bg-light">
          <span className="small fw-medium text-dark">• User Engagement Report</span>
          <PieChart size={16} className="text-muted" />
        </div>
        <div className="d-flex align-items-center justify-content-between p-2 rounded mb-2 bg-light">
          <span className="small fw-medium text-dark">• Course Completion Analytics</span>
          <BarChart3 size={16} className="text-muted" />
        </div>
        <div className="d-flex align-items-center justify-content-between p-2 rounded mb-2 bg-light">
          <span className="small fw-medium text-dark">• Consultation Success Metrics</span>
          <TrendingUp size={16} className="text-muted" />
        </div>
        <div className="d-flex align-items-center justify-content-between p-2 rounded mb-2 bg-light">
          <span className="small fw-medium text-dark">• Risk Assessment Trends</span>
          <Activity size={16} className="text-muted" />
        </div>
        <div className="d-flex align-items-center justify-content-between p-2 rounded bg-light">
          <span className="small fw-medium text-dark">• Community Program Impact</span>
          <Users size={16} className="text-muted" />
        </div>
      </div>
      
      <div className="d-flex align-items-center justify-content-end">
        <div className="d-flex align-items-center text-primary fw-semibold">
          Generate <ChevronRight size={16} className="ms-1" />
        </div>
      </div>
    </Card.Body>
  </Card>
);

export default AnalyticsPreview;