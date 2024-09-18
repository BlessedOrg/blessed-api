import Link from "next/link";
import { appDashboardSidebarNavItems } from "@/components/appDashboard/appDashboardSidebarNav/appDashboardSidebarNavItems";

export const AppDashboardSidebarNav = ({ currentTabIndex, onTabChange, className }) => {
  return (
    <div className={`xl:sticky xl:top-[6.25rem] xl:h-[calc(100vh-6.25rem)] xl:min-w-[15.5rem] ${className || ""}`}>
      <ul className="bg-white p-2 rounded-3xl">
        {appDashboardSidebarNavItems.map((nav, index) => {
          const isActive = nav.id === currentTabIndex;
          return (
            <li key={nav.label + index}>
              <Link
                onClick={() => !!onTabChange && onTabChange()}
                href={nav.href}
                className={`rounded-full px-5 py-2 font-semibold hover:bg-gray-300 w-full text-left my-1 block ${isActive ? "bg-gray-500" : ""}`}
              >
                {nav.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
