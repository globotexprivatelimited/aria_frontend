/** Blueprint - the founder console's visual language. */
export const T = {
  base: "#F3F6F8",
  panel: "#FFFFFF",
  sunk: "#EDF1F4",
  line: "#DCE3E9",
  ink: "#12212B",
  graphite: "#5A6B75",
  dim: "#93A2AC",
  cobalt: "#2F5FD0",
  cobaltSoft: "#EAF0FC",
  jade: "#1E8A6B",
  jadeSoft: "#E6F3EF",
  amber: "#B8862F",
  amberSoft: "#FBF2E2",
  coral: "#D6453F",
  coralSoft: "#FCEDEC",
  violet: "#6B5FC4",
  violetSoft: "#EFEDFA",
} as const;

export const mono = "'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace";
export const display = "'Bricolage Grotesque', 'Segoe UI', system-ui, sans-serif";

export const panel = { background: T.panel, border: "1px solid " + T.line, borderRadius: 12 } as const;

export const micro = {
  fontFamily: mono, fontSize: 10, letterSpacing: ".13em",
  textTransform: "uppercase" as const, color: T.dim,
};

export const figure = (size = 26, color: string = T.ink) => ({
  fontFamily: mono, fontSize: size, fontWeight: 500, color,
  letterSpacing: "-.02em", lineHeight: 1,
});

export const rupee = "\u20B9";
export const money = (n: number) => rupee + Math.round(n).toLocaleString("en-IN");

/** Smooth trace through values - the live wire. */
export function trace(vals: number[], w: number, h: number, pad = 3) {
  if (!vals.length) return { line: "", area: "" };
  const v = vals.length === 1 ? [vals[0], vals[0]] : vals;
  const max = Math.max(...v, 1);
  const step = w / (v.length - 1);
  const pts = v.map((x, i) => [i * step, h - pad - (x / max) * (h - pad * 2)] as [number, number]);
  let d = "M" + pts[0][0].toFixed(1) + "," + pts[0][1].toFixed(1);
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const cx = (x0 + x1) / 2;
    d += " C" + cx.toFixed(1) + "," + y0.toFixed(1) + " " + cx.toFixed(1) + "," + y1.toFixed(1) + " " + x1.toFixed(1) + "," + y1.toFixed(1);
  }
  return { line: d, area: d + " L" + w + "," + h + " L0," + h + " Z" };
}
