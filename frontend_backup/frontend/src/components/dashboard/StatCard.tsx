import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  tone: "blue" | "green" | "red" | "orange";
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  tone,
}: StatCardProps) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-card-header">
        <span>{title}</span>

        <div className="stat-card-icon">
          {icon}
        </div>
      </div>

      <h2>{value}</h2>

      <p>{subtitle}</p>
    </div>
  );
}