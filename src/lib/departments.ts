export type DeptType = "auto" | "accept";

export type DeptCode = "fb" | "housekeeping" | "spa" | "front_desk" | "dining" | "maintenance";

export type DeptConfig = {
  slug: string;
  dept: string;
  label: string;
  type: DeptType;
  staffNumber: string;
  color: string;
  bgClass: string;
  textClass: string;
};

export const DEPT_COLORS: Record<string, string> = {
  fb: "#12433A",
  housekeeping: "#3A6EA5",
  spa: "#8E5AA8",
  front_desk: "#C9A227",
  dining: "#B0763A",
  maintenance: "#7A6A55",
};

export const DEPT_BG_CLASSES: Record<string, string> = {
  fb: "bg-dept-fb",
  housekeeping: "bg-dept-housekeeping",
  spa: "bg-dept-spa",
  front_desk: "bg-dept-front_desk",
  dining: "bg-dept-dining",
  maintenance: "bg-dept-maintenance",
};

export const DEPARTMENTS: DeptConfig[] = [
  {
    slug: "in-room-dining",
    dept: "fb",
    label: "In-Room Dining",
    type: "auto",
    staffNumber: "+919000000003",
    color: DEPT_COLORS.fb,
    bgClass: DEPT_BG_CLASSES.fb,
    textClass: "text-dept-fb",
  },
  {
    slug: "housekeeping",
    dept: "housekeeping",
    label: "Housekeeping",
    type: "auto",
    staffNumber: "+919000000002",
    color: DEPT_COLORS.housekeeping,
    bgClass: DEPT_BG_CLASSES.housekeeping,
    textClass: "text-dept-housekeeping",
  },
  {
    slug: "spa",
    dept: "spa",
    label: "Spa",
    type: "accept",
    staffNumber: "+919000000005",
    color: DEPT_COLORS.spa,
    bgClass: DEPT_BG_CLASSES.spa,
    textClass: "text-dept-spa",
  },
  {
    slug: "front-desk",
    dept: "front_desk",
    label: "Front Desk",
    type: "accept",
    staffNumber: "+919000000001",
    color: DEPT_COLORS.front_desk,
    bgClass: DEPT_BG_CLASSES.front_desk,
    textClass: "text-dept-front_desk",
  },
  {
    slug: "dining",
    dept: "dining",
    label: "Dining",
    type: "accept",
    staffNumber: "+919000000006",
    color: DEPT_COLORS.dining,
    bgClass: DEPT_BG_CLASSES.dining,
    textClass: "text-dept-dining",
  },
  {
    slug: "maintenance",
    dept: "maintenance",
    label: "Maintenance",
    type: "accept",
    staffNumber: "+919000000007",
    color: DEPT_COLORS.maintenance,
    bgClass: DEPT_BG_CLASSES.maintenance,
    textClass: "text-dept-maintenance",
  },
];

export function deptBySlug(slug: string): DeptConfig | undefined {
  return DEPARTMENTS.find((d) => d.slug === slug);
}

export function getDeptLabel(dept: string): string {
  return DEPARTMENTS.find((d) => d.dept === dept)?.label ?? dept;
}

export function getDeptColor(dept: string): string {
  return DEPT_COLORS[dept] ?? "#C9A227";
}

export function getDeptBgClass(dept: string): string {
  return DEPT_BG_CLASSES[dept] ?? "bg-champagne";
}