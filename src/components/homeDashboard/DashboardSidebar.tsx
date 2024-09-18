import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export const DashboardSidebar = () => {
  return (
    <div className="xl:sticky xl:top-[6.25rem] xl:h-[calc(100vh-6.25rem)] xl:min-w-[21rem] flex flex-col gap-4">
      <div className="bg-secondary w-full rounded-3xl flex justify-between gap-2 items-center px-6 py-4">
        <div className="flex items-center gap-2">
          <Image src={"/img/icons/video.svg"} alt="video icon" width={40} height={40} />
          <span className="font-semibold">Start guide</span>
        </div>

        <ChevronDown size={32} />
      </div>
      <div className="bg-secondary-500 p-6 rounded-3xl flex flex-col gap-4">
        <p className="font-semibold text-xl">Tips for your tickets</p>
        <div>
          <p className="font-semibold">Add multiple ticket tiers</p>
          <span>Maximize sales and offer a unique experience for every attendee.</span>
        </div>
        <div>
          <p className="font-semibold">Set up early bird pricing</p>
          <span>Boost initial ticket sales and reward your most eager fans!</span>
        </div>
      </div>
      <div className="bg-secondary-500 w-full rounded-3xl flex justify-between gap-2 items-center p-6">
        <span className="font-semibold">
          Need more details?{" "}
          <Link href={"/docs"} className="underline font-normal">
            Visit our Docs
          </Link>
        </span>
      </div>
    </div>
  );
};
