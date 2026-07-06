"use client";

import { supabase } from "./supabase";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/+$/, "");

class ApiError extends Error {
  status: number;
  body: any;
  constructor(status: number, body: any) {
    super(body?.message || body?.error || "Request failed");
    this.status = status;
    this.body = body;
  }
}

async function request(path: string, options: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body);
  return body;
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, data?: unknown) =>
    request(path, { method: "POST", body: data ? JSON.stringify(data) : undefined }),
  patch: (path: string, data?: unknown) =>
    request(path, { method: "PATCH", body: data ? JSON.stringify(data) : undefined }),
};

export { ApiError };
