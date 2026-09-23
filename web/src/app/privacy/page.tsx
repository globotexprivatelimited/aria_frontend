"use client";

import { useActionState } from "react";
import { exportGuest, eraseGuest } from "./actions";

const field = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";
const label = "block text-xs font-medium uppercase tracking-wider text-slate-500";

export default function PrivacyPage() {
  const [exState, exAction, exPending] = useActionState(exportGuest, null);
  const [erState, erAction, erPending] = useActionState(eraseGuest, null);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Privacy</h1>
      <p className="mt-1 text-sm text-slate-500">
        Guest data rights under the Digital Personal Data Protection Act.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Export a guest&rsquo;s data</h2>
          <p className="mt-1 text-xs text-slate-400">Everything the hotel holds about them.</p>
          <form action={exAction} className="mt-4 space-y-3">
            <div>
              <label className={label}>WhatsApp number</label>
              <input name="phone" className={field} placeholder="+919876543210" />
            </div>
            <button className="w-full rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:opacity-50" disabled={exPending}>
              {exPending ? "Gathering&hellip;" : "Export data"}
            </button>
          </form>
          {exState?.message && (
            <p className={"mt-3 text-sm " + (exState.ok ? "text-emerald-800" : "text-red-700")}>{exState.message}</p>
          )}
          {exState?.data && (
            <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
              {JSON.stringify(exState.data, null, 2)}
            </pre>
          )}
        </div>

        <div className="rounded-xl border border-red-200 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-red-700">Erase a guest&rsquo;s data</h2>
          <p className="mt-1 text-xs text-slate-400">
            Deletes their messages and anonymises their records. This cannot be undone.
          </p>
          <form action={erAction} className="mt-4 space-y-3">
            <div>
              <label className={label}>WhatsApp number</label>
              <input name="phone" className={field} placeholder="+919876543210" />
            </div>
            <button className="w-full rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800 disabled:opacity-50" disabled={erPending}>
              {erPending ? "Erasing&hellip;" : "Erase permanently"}
            </button>
          </form>
          {erState && (
            <p className={"mt-3 text-sm " + (erState.ok ? "text-emerald-800" : "text-red-700")}>{erState.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
