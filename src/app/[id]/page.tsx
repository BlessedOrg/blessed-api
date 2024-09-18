import { AppDashboard } from "@/components/appDashboard/AppDashboard";
import { AppDashboardNav } from "@/components/appDashboard/appDashboardNav/AppDashboardNav";

export default function AppPage() {
  return (
    <div className="flex w-full flex-col bg-gray-500">
      <AppDashboardNav />
      <AppDashboard />
    </div>
  );
}
