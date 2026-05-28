import { DashboardClient } from "@/components/layout/DashboardClient";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardClient>{children}</DashboardClient>;
}