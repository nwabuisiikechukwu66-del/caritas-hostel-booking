"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Wallet, MessageSquareWarning, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

const items = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/payments", label: "Payments", icon: Wallet },
  { href: "/admin/complaints", label: "Complaints", icon: MessageSquareWarning },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link href="/admin/dashboard" className="text-sm font-semibold text-primary">
          Caritas Hostel Admin
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded px-3 py-2 text-sm font-medium ${
                  active ? "bg-primary-light text-primary" : "text-ink-muted hover:bg-surface-subtle"
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
          <button
            onClick={signOut}
            className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-ink-muted hover:bg-surface-subtle"
          >
            <LogOut size={16} aria-hidden="true" />
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}
