import { cookies } from "next/headers";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { ADMIN_COOKIE, ADMIN_SEEN_COOKIE, adminPasswordConfigured, isAdminToken } from "@/lib/adminSession";
import { loadAdminOverview } from "@/lib/bookingRecords";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const jar = await cookies();
  if (!isAdminToken(jar.get(ADMIN_COOKIE)?.value)) {
    return <AdminLogin configured={adminPasswordConfigured()} />;
  }
  const overview = await loadAdminOverview(jar.get(ADMIN_SEEN_COOKIE)?.value ?? null);
  return <AdminDashboard overview={overview} />;
}
