"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { DashboardNav } from "../DashboardNav";
import { dashboardNavItems } from "../dashboardNavItems";
import { Menu } from "lucide-react";

export const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen((prev) => !prev);

  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "dashboard";
  const currentTabIndex = dashboardNavItems.findIndex((item) => item.href === `?tab=${currentTab}`);

  return (
    <>
      <button onClick={toggleMenu} className="md:hidden">
        <Menu size={28} />
      </button>
      <div
        className={`flex flex-col md:hidden fixed top-[6.25rem] left-0 w-full h-[calc(100dvh-6.25rem)] bg-gray-500 transition-all duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full px-4"
        }`}
      >
        <DashboardNav currentTabIndex={currentTabIndex} onTabChange={toggleMenu} />
      </div>
    </>
  );
};
