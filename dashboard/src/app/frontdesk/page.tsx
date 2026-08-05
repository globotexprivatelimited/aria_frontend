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
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Front desk</h1>
      <p className="mt-1 text-sm text-slate-500">
        Registering a guest here verifies their room, so Aria can act on their requests.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Check in</h2>
          <form action={inAction} className="mt-4 space-y-3">
            <div>
              <label className={label}>Room</label>
              <input name="room" className={field} placeholder="305" />
            </div>
            <div>
              <label className={label}>Guest name</label>
              <input name="name" className={field} placeholder="Ravi Kumar" />
            </div>
            <div>
              <label className={label}>WhatsApp number</label>
              <input name="phone" className={field} placeholder="+919876543210" />
            </div>
            <button className={button} disabled={inPending}>
              {inPending ? "Checking in&hellip;" : "Check in guest"}
            </button>
          </form>
          {inState && (
            <p className={"mt-3 text-sm " + (inState.ok ? "text-emerald-800" : "text-red-700")}>{inState.message}</p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Check out</h2>
          <form action={outAction} className="mt-4 space-y-3">
            <div>
              <label className={label}>Room</label>
              <input name="room" className={field} placeholder="305" />
            </div>
            <button className={button} disabled={outPending}>
              {outPending ? "Checking out&hellip;" : "Check out room"}
            </button>
          </form>
          {outState && (
            <p className={"mt-3 text-sm " + (outState.ok ? "text-emerald-800" : "text-red-700")}>{outState.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
