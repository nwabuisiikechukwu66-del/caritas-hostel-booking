import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Caritas University Hostel Portal",
  description: "Book and manage your hostel accommodation at Caritas University, Enugu.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface-subtle font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
