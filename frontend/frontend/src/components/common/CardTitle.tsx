import React from "react";

interface CardTitleProps {
  icon: React.ReactNode;
  children: React.ReactNode;
}

export default function CardTitle({
  icon,
  children,
}: CardTitleProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div style={{ color: "#3DD9EB" }}>{icon}</div>
      <h3
        className="text-sm font-semibold tracking-wide"
        style={{ color: "#F8FAFC" }}
      >
        {children}
      </h3>
    </div>
  );
}