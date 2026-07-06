const styles: Record<string, string> = {
  vacant: "bg-success-bg text-success",
  occupied: "bg-ink-faint/20 text-ink-muted",
  reserved: "bg-warning-bg text-warning",
  paid: "bg-success-bg text-success",
  unpaid: "bg-danger-bg text-danger",
  open: "bg-danger-bg text-danger",
  in_progress: "bg-warning-bg text-warning",
  resolved: "bg-success-bg text-success",
  low: "bg-surface-subtle text-ink-muted",
  medium: "bg-warning-bg text-warning",
  high: "bg-danger-bg text-danger",
};

export function Badge({ value, label }: { value: string; label?: string }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${styles[value] || "bg-surface-subtle text-ink-muted"}`}>
      {label ?? value.replace("_", " ")}
    </span>
  );
}
