import { ReactNode } from "react";
import styles from "./StatCard.module.css";

interface StatCardProps {
  title: string;
  value: string | number;
  color?: string;
  icon?: ReactNode;
  onClick?: () => void;
}

const StatCard = ({
  title,
  value,
  color = "#3b82f6", // Màu nền mặc định (blue-500)
  icon,
  onClick,
}: StatCardProps) => {
  return (
    <div
      className={`${styles.card} ${onClick ? styles.clickable : ""}`}
      onClick={onClick}
      style={{ backgroundColor: color }}
    >
      <div className={styles.iconContainer}>
        {icon || "📊"}
      </div>
      <div className={styles.textGroup}>
        <span className={styles.title}>{title}</span>
        <span className={styles.value}>{value ?? "—"}</span>
      </div>
    </div>
  );
};

export default StatCard;
