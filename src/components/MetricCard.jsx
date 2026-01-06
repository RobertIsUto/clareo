import React from 'react';

export const MetricCard = ({ value, label, sublabel, warning, tooltip }) => (
  <div className="metric-card" title={tooltip}>
    <div className="metric-value" style={{ color: warning ? "var(--warning)" : "var(--primary)" }}>
      {value}
    </div>
    <div className="metric-label">{label}</div>
    {sublabel && <div className="metric-sublabel">{sublabel}</div>}
    {warning && <div className="metric-warning">{warning}</div>}
  </div>
);
