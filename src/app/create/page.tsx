import { CreateDashboard } from "@/components/createDashboard/CreateDashboard";
import { CreateDashboardNav } from "@/components/createDashboard/createDashboardNav/CreateDashboardNav";
import { Suspense } from "react";

export default function CreatePage() {
  return (
    <div className="flex w-full flex-col bg-gray-500">
      <CreateDashboardNav />
      <Suspense>
        <CreateDashboard />
      </Suspense>
    </div>
  );
}
