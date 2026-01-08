import React from 'react';

export const MetricCard = ({ value, label, sublabel, warning, tooltip, onClick, clickable = false }) => (
  <div
    className={`metric-card ${clickable ? 'clickable-metric-card' : ''}`}
    title={clickable ? `${tooltip} - Click for calculation details` : tooltip}
    onClick={onClick}
    style={{ cursor: clickable ? 'pointer' : 'default' }}
  >
    <div className="metric-value" style={{ color: warning ? "var(--warning)" : "var(--primary)" }}>
      {value}
    </div>
    <div className="metric-label">{label}</div>
    {sublabel && <div className="metric-sublabel">{sublabel}</div>}
    {warning && <div className="metric-warning">{warning}</div>}
  </div>
);
