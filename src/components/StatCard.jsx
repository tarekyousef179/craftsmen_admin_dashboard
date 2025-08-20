import React from "react";

export default function StatCard({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center justify-center bg-[var(--color-card)] text-[var(--color-card-foreground)] rounded-xl shadow-md border border-[var(--color-primary-100)] p-6 min-w-[120px] min-h-[120px]">
      <div className="mb-2 text-3xl">{icon}</div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm text-[var(--color-muted-foreground)] font-semibold text-center">{label}</div>
    </div>
  );
} 