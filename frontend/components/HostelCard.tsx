import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import type { Hostel } from "@/lib/types";

export function HostelCard({ hostel }: { hostel: Hostel }) {
  return (
    <Link
      href={`/hostels/${hostel.id}`}
      className="flex items-center justify-between rounded-lg border border-border bg-white p-4 transition-colors hover:border-primary"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded bg-primary-light text-primary">
          <Building2 size={20} aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-medium text-ink">{hostel.name}</p>
          <p className="text-xs text-ink-muted">Code {hostel.short_code}</p>
        </div>
      </div>
      <ArrowRight size={18} className="text-ink-faint" aria-hidden="true" />
    </Link>
  );
}
