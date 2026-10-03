import { apiGet } from "@/lib/api";

type Req = {
  id: string;
  roomNumber: string | null;
  guestPhone: string;
  intent: string | null;
  department: string | null;
  requestDetail: string | null;
  priority: string;
  status: string;
  createdAt: string;
};

export default async function RequestsPage() {
  let rows: Req[] = [];
  let error: string | null = null;
  try {
    const data = await apiGet<{ count: number; requests: Req[] }>("/api/dashboard/requests");
    rows = data.requests;
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
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Requests</h1>
            <p className="mt-1 text-sm text-slate-500">{rows.length} on record</p>
          </div>
          <a href="/gm/requests" className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
            Open in GM Console &rarr;
          </a>
        </div>

        {rows.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <div className="text-sm font-medium text-slate-700">No requests yet</div>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Guest messages are being received and logged, but they are not yet being turned into
              departmental requests. That begins when the AI brain is connected.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Room</th>
                    <th className="px-5 py-3 font-medium">Request</th>
                    <th className="px-5 py-3 font-medium">Department</th>
                    <th className="px-5 py-3 font-medium">Priority</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Received</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/50 transition">
                      <td className="px-5 py-4 font-semibold">{r.roomNumber ?? "\u2014"}</td>
                      <td className="px-5 py-4 text-slate-700">{r.requestDetail ?? r.intent ?? "\u2014"}</td>
                      <td className="px-5 py-4 capitalize text-slate-600">{r.department ?? "\u2014"}</td>
                      <td className="px-5 py-4">
                        <span className={"rounded-full px-2.5 py-1 text-xs font-medium " + (r.priority === "urgent" || r.priority === "emergency" ? "bg-red-50 text-red-800" : "bg-slate-100 text-slate-700")}>
                          {r.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4 capitalize text-slate-600">{r.status}</td>
                      <td className="px-5 py-4 text-slate-500">{new Date(r.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
