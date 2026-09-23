export type DeptType = "auto" | "accept";

export type DeptConfig = {
  slug: string; dept: string; label: string; type: DeptType; staffNumber: string;
};

export const DEPARTMENTS: DeptConfig[] = [
  { slug: "in-room-dining", dept: "fb",           label: "In-Room Dining", type: "auto",   staffNumber: "+919000000003" },
  { slug: "housekeeping",   dept: "housekeeping", label: "Housekeeping",   type: "auto",   staffNumber: "+919000000002" },
  { slug: "spa",            dept: "spa",          label: "Spa",            type: "accept", staffNumber: "+919000000005" },
  { slug: "front-desk",     dept: "front_desk",   label: "Front Desk",     type: "accept", staffNumber: "+919000000001" },
  { slug: "dining",         dept: "dining",       label: "Dining",         type: "accept", staffNumber: "+919000000006" },
  { slug: "maintenance",    dept: "maintenance",  label: "Maintenance",    type: "accept", staffNumber: "+919000000007" },
];

export function deptBySlug(slug: string): DeptConfig | undefined {
  return DEPARTMENTS.find((d) => d.slug === slug);
}