import { HomeDashboard } from "@/components/homeDashboard/HomeDashboard";
import { Navigation } from "@/components/homeDashboard/navigation/Navigation";

export default function HomePage() {
  return (
    <div className="flex w-full flex-col bg-gray-500">
      <Navigation />
      <HomeDashboard />
    </div>
  );
}
