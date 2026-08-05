import Link from "next/link";
import { apiGet } from "@/lib/api";

type Thread = {
  phone: string;
  session: { state: string; room: string | null; name: string | null; verified: boolean } | null;
  messageCount: number;
  messages: { at: string; direction: string; type: string; body: string | null }[];
};

export default async function ConversationPage({ params }: { params: Promise<{ phone: string }> }) {
  const { phone } = await params;
  const decoded = decodeURIComponent(phone);

  let thread: Thread | null = null;
  let error: string | null = null;
  try {
    thread = await apiGet<Thread>("/api/dashboard/conversations/" + encodeURIComponent(decoded));
  } catch (e) {
    error = e instanceof Error ? e.message : "unknown error";
  }

  if (error || !thread) {
    return <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">{error}</div>;
  }

  return (
    <div>
      <Link href="/guests" className="text-sm text-slate-500 hover:text-emerald-800">&larr; Back to guests</Link>

      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {thread.session?.name ?? "Unknown guest"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {thread.session?.room ? "Room " + thread.session.room : "No room"} &middot; {thread.phone}
          </p>
        </div>
        {thread.session && (
          <span className={"rounded-full px-3 py-1 text-xs font-medium " + (thread.session.verified ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800")}>
            {thread.session.verified ? "Front desk verified" : "Self reported"}
          </span>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 text-xs uppercase tracking-wider text-slate-400">
          {thread.messageCount} messages &middot; kept verbatim for dispute resolution
        </div>

        {thread.messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No messages on record.</p>
        ) : (
          <div className="space-y-3">
            {thread.messages.map((m, i) => (
              <div key={i} className={"flex " + (m.direction === "inbound" ? "justify-start" : "justify-end")}>
                <div className={"max-w-lg rounded-2xl px-4 py-2.5 " + (m.direction === "inbound" ? "bg-slate-100 text-slate-800" : "bg-emerald-700 text-white")}>
                  <div className="text-sm leading-relaxed">{m.body ?? "[" + m.type + "]"}</div>
                  <div className={"mt-1 text-[11px] " + (m.direction === "inbound" ? "text-slate-400" : "text-emerald-100")}>
                    {new Date(m.at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}