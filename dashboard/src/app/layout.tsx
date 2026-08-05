import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aria - Hotel Console",
  description: "Guest requests, conversations and alerts",
};

const nav = [
  { href: "/", label: "Overview" },
  { href: "/guests", label: "Guests" },
  { href: "/requests", label: "Requests" },
  { href: "/alerts", label: "Alerts" },
  { href: "/frontdesk", label: "Front desk" },
  { href: "/privacy", label: "Privacy" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}