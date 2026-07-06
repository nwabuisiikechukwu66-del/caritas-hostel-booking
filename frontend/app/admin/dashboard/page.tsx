"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAdminSession } from "@/lib/session";
import { AdminNav } from "@/components/AdminNav";
import type { OccupancyReportRow } from "@/lib/types";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { loading, admin } = useAdminSession();
  const [report, setReport] = useState<OccupancyReportRow[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !admin) router.replace("/admin/login");
  }, [loading, admin, router]);

  useEffect(() => {
    if (!admin) return;
    api.get("/api/admin/reports/occupancy").then((res) => {
      setReport(res.report ?? []);
      setFetching(false);
    });
  }, [admin]);

  if (loading || !admin || fetching) {
    return <div className="p-6 text-sm text-ink-muted">Loading...</div>;
  }

  const totals = report.reduce(
    (acc, r) => ({ total: acc.total + r.total_beds, occupied: acc.occupied + r.occupied_beds }),
    { total: 0, occupied: 0 }
  );

  return (
    <div>
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <h1 className="text-lg font-semibold text-ink">Occupancy overview</h1>
        <p className="text-sm text-ink-muted">
          {admin.role === "super_admin" ? "All hostels" : "Your assigned hostel"} &middot; {totals.occupied} of {totals.total} beds occupied
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {report.map((row) => (
            <div key={row.hostel} className="rounded-lg border border-border bg-white p-4">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-primary" aria-hidden="true" />
                <p className="text-sm font-medium text-ink">{row.hostel}</p>
              </div>
              <p className="mt-1 text-xs capitalize text-ink-muted">{row.gender} hostel</p>

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
                <div className="h-full bg-primary" style={{ width: `${row.occupancy_rate}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-ink-muted">
                <span>{row.occupied_beds} occupied</span>
                <span>{row.vacant_beds} vacant</span>
                <span className="font-medium text-ink">{row.occupancy_rate}%</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
