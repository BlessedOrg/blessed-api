"use client";
import { DashboardNav } from "@/components/homeDashboard/DashboardNav";
import { DashboardSidebar } from "@/components/homeDashboard/DashboardSidebar";
import { Suspense, useState } from "react";
import { DashboardContent } from "./DashboardContent";
import { LoadingDashboardSkeleton } from "./LoadingDashboardSkeleton";

export const HomeDashboard = () => {
  const [currentTabIndex, setCurrentTabIndex] = useState(0);

  const onTabChange = (index) => {
    setCurrentTabIndex(index);
  };

  return (
    <main className="flex xl:flex-row flex-col-reverse md:flex-col gap-6 w-full px-[1.5rem] max-w-[90rem] self-center">
      <DashboardNav currentTabIndex={currentTabIndex || 0} className="hidden md:block" />
      <Suspense fallback={<LoadingDashboardSkeleton />}>
        <DashboardContent currentTabIndex={currentTabIndex} onTabChange={onTabChange} />
      </Suspense>
      <DashboardSidebar />
    </main>
  );
};
