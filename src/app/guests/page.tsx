import Link from "next/link";
import { apiGet } from "@/lib/api";

type Guest = {
  sessionId: string;
  phone: string;
  room: string | null;
  name: string | null;
  state: string;
  verified: boolean;
  verificationMethod: string | null;
  checkInDate: string | null;
  lastMessageAt: string | null;
};

export default async function GuestsPage() {
  let guests: Guest[] = [];
  let error: string | null = null;
  try {
    const data = await apiGet<{ count: number; guests: Guest[] }>("/api/dashboard/guests");
    guests = data.guests;
  } catch (e) {
    error = e instanceof Error ? e.message : "unknown error";
  }

  if (error) {
    return <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Guests</h1>
            <p className="mt-1 text-sm text-slate-500">{guests.length} in house</p>
          </div>
          <Link href="/gm/guests" className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
            Open in GM Console &rarr;
          </Link>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Room</th>
                  <th className="px-5 py-3 font-medium">Guest</th>
                  <th className="px-5 py-3 font-medium">Verification</th>
                  <th className="px-5 py-3 font-medium">State</th>
                  <th className="px-5 py-3 font-medium">Last message</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {guests.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500">No guests in house.</td></tr>
                )}
                {guests.map((g) => (
                  <tr key={g.sessionId} className="border-t border-slate-100 hover:bg-slate-50/50 transition">
                    <td className="px-5 py-4 font-semibold text-slate-900">{g.room ?? "\u2014"}</td>
                    <td className="px-5 py-4 text-slate-700">{g.name ?? "Unknown"}</td>
                    <td className="px-5 py-4">
                      {g.verified ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">Front desk</span>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">Self reported</span>
                      )}
                    </td>
                    <td className="px-5 py-4 capitalize text-slate-600">{g.state}</td>
                    <td className="px-5 py-4 text-slate-500">
                      {g.lastMessageAt ? new Date(g.lastMessageAt).toLocaleString() : "\u2014"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={"/conversations/" + encodeURIComponent(g.phone)}
                        className="text-sm font-medium text-emerald-800 hover:underline"
                      >
                        View chat
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
