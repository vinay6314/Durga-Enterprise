import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  color?: string;
  bgColor?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  color = 'var(--accent-primary)',
  bgColor = 'rgba(99, 102, 241, 0.15)',
}) => {
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        <div className="kpi-icon-wrap" style={{ background: bgColor, color }}>
          <Icon size={22} />
        </div>
      </div>
      <div>
        <div className="kpi-value">{value}</div>
        {subtext && <div className="kpi-subtext">{subtext}</div>}
      </div>
    </div>
  );
};
