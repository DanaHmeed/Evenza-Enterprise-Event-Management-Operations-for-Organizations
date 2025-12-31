import { syncUserToDatabase } from "@/lib/auth/sync-user";

export default async function DashboardPage() {
  await syncUserToDatabase();

  return <div>Admin Panel</div>;
}
