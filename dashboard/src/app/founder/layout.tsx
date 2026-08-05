import AuthGuard from "../../components/AuthGuard";
export default function FounderLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard allow={["founder"]}>{children}</AuthGuard>;
}