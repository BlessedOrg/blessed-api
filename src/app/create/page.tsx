import { CreateDashboard } from "@/components/createDashboard/CreateDashboard";
import { CreateDashboardNav } from "@/components/createDashboard/createDashboardNav/CreateDashboardNav";

export default function CreatePage() {
  return (
    <div className="flex w-full flex-col bg-gray-500">
      <CreateDashboardNav />
      <CreateDashboard />
    </div>
  );
}
