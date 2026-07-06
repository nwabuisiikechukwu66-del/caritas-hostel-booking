import { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border-strong bg-white px-6 py-12 text-center">
      <span className="text-ink-faint">{icon}</span>
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="mt-1 text-sm text-ink-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
