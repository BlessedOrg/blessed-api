import { Card } from "@/components/Card";
import { CustomButton } from "@/components/CustomButton";
import { EntriesView } from "@/components/homeDashboard/views/EntriesView";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const Dashboard = () => {
  return (
    <div className="w-full flex flex-col gap-10 pb-10">
      <Card className="bg-primary flex flex-col gap-10">
        <div>
          <h2 className="font-bold text-3xl uppercase">Start creating</h2>
          <p className="text-sm">Create and manage your entry API in just three steps.</p>
        </div>
        <CustomButton className="bg-transparent border-2 border-black-50 w-fit">Create entry</CustomButton>
      </Card>

      <Card className="flex gap-5 justify-between">
        <div className="flex-col flex justify-between pb-3">
          <div>
            <p className="text-sm text-gray-200 uppercase font-semibold">August 20, 2024</p>
            <h2 className="font-bold text-3xl uppercase">Total ticket sales</h2>
          </div>
          <div className="flex gap-1 items-center">
            <Link href={"/"} className="font-semibold">
              More ticket insights{" "}
            </Link>
            <ChevronRight size={28} />
          </div>
        </div>
        <div className="relative w-[144px] h-[144px]">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#EFEFEF"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#06F881"
              strokeWidth="3"
              strokeDasharray="100, 100"
              strokeDashoffset="25"
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-bold">
            75%
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        <h2 className="font-semibold text-xl">Upcoming dates</h2>
        <Card className="flex flex-col">
          <p className="text-sm text-gray-200 uppercase font-semibold">Next</p>
          <h3 className="font-semibold text-lg">Gaming pass 2025</h3>
          <p className="text-sm text-gray-200 uppercase font-semibold">August 20, 2024</p>
        </Card>
      </div>

      <EntriesView />
    </div>
  );
};
