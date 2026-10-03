"use client";

import { useActionState } from "react";
import { checkIn, checkOut } from "./actions";

const field = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";
const label = "block text-xs font-medium uppercase tracking-wider text-slate-500";
const button = "mt-4 w-full rounded-lg bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:opacity-50";

export default function FrontDeskPage() {
  const [inState, inAction, inPending] = useActionState(checkIn, null);
  const [outState, outAction, outPending] = useActionState(checkOut, null);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Front desk</h1>
            <p className="mt-1 text-sm text-slate-500">
              Registering a guest here verifies their room, so Aria can act on their requests.
            </p>
          </div>
          <a href="/gm/reception" className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
            Open Room Board &rarr;
          </a>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800">Check in</h2>
            <form action={inAction} className="mt-4 space-y-3.5">
              <div>
                <label className={label}>Room</label>
                <input name="room" className={field} placeholder="305" required />
              </div>
              <div>
                <label className={label}>Guest name</label>
                <input name="name" className={field} placeholder="Ravi Kumar" required />
              </div>
              <div>
                <label className={label}>WhatsApp number</label>
                <input name="phone" className={field} placeholder="+919876543210" required />
              </div>
              <button className={button} disabled={inPending}>
                {inPending ? "Checking in\u2026" : "Check in guest"}
              </button>
            </form>
            {inState && (
              <p className={"mt-3.5 rounded-lg p-3 text-sm " + (inState.ok ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200")}>{inState.message}</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">Check out</h2>
            <form action={outAction} className="mt-4 space-y-3.5">
              <div>
                <label className={label}>Room</label>
                <input name="room" className={field} placeholder="305" required />
              </div>
              <button className={button} disabled={outPending}>
                {outPending ? "Checking out\u2026" : "Check out room"}
              </button>
            </form>
            {outState && (
              <p className={"mt-3.5 rounded-lg p-3 text-sm " + (outState.ok ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200")}>{outState.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
