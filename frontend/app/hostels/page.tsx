"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useStudentSession } from "@/lib/session";
import { StudentNav } from "@/components/StudentNav";
import { HostelCard } from "@/components/HostelCard";
import { EmptyState } from "@/components/EmptyState";
import { Building2 } from "lucide-react";
import type { Hostel } from "@/lib/types";

export default function HostelsPage() {
  const router = useRouter();
  const { loading, userId, student } = useStudentSession();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !userId) router.replace("/login");
  }, [loading, userId, router]);

  useEffect(() => {
    if (!student) return;
    supabase
      .from("hostels")
      .select("*")
      .eq("gender", student.gender)
      .order("name")
      .then(({ data }) => {
        setHostels((data as Hostel[]) ?? []);
        setFetching(false);
      });
  }, [student]);

  if (loading || !student || fetching) {
    return <div className="p-6 text-sm text-ink-muted">Loading...</div>;
  }

  return (
    <div className="pb-20 sm:pb-6">
      <StudentNav />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <h1 className="text-lg font-semibold text-ink">Hostels</h1>
        <p className="text-sm text-ink-muted">Showing hostels available to you.</p>

        {hostels.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<Building2 size={28} aria-hidden="true" />}
              title="No hostels available"
              description="Check back later or contact the hostel office."
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {hostels.map((hostel) => (
              <HostelCard key={hostel.id} hostel={hostel} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
