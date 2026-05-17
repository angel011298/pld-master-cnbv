import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm transition-all duration-200",
        className
      )}
    >
      {icon && <div className="mb-2 text-neutral-400">{icon}</div>}
      <p className="text-2xl font-bold tracking-tight text-neutral-900">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-neutral-500">{label}</p>
    </div>
  );
}
