import AuthGuard from "../../components/AuthGuard";
export default function GMLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard allow={["gm"]}>{children}</AuthGuard>;
}