"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Building2, MessageSquareWarning, LogOut, type LucideIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const items: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/hostels", label: "Hostels", icon: Building2 },
  { href: "/complaints", label: "Complaints", icon: MessageSquareWarning },
];

export function StudentNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <>
      {/* Top bar - visible from tablet up */}
      <header className="hidden border-b border-border bg-white sm:block">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/dashboard" className="text-sm font-semibold text-primary">
            Caritas Hostel Portal
          </Link>
          <nav className="flex items-center gap-1">
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
              className="ml-2 flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-ink-muted hover:bg-surface-subtle"
            >
              <LogOut size={16} aria-hidden="true" />
              Sign out
            </button>
          </nav>
        </div>
      </header>

      {/* Bottom tab bar - mobile only */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-border bg-white sm:hidden">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
                active ? "text-primary" : "text-ink-muted"
              }`}
            >
              <Icon size={20} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
        <button onClick={signOut} className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium text-ink-muted">
          <LogOut size={20} aria-hidden="true" />
          Sign out
        </button>
      </nav>
    </>
  );
}
