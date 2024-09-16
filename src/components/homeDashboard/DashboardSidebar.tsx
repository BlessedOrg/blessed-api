import Image from "next/image";
import Link from "next/link";

export const DashboardSidebar = () => {
  return (
    <div className="xl:sticky xl:top-[6.25rem] xl:h-[calc(100vh-6.25rem)] xl:min-w-[21rem] flex flex-col gap-4">
      <div className="bg-secondary w-full rounded-3xl flex justify-between gap-2 items-center px-6 py-4">
        <span className="font-semibold">Start guide</span>
        <Image src={"/img/icons/video.svg"} alt="video icon" width={40} height={40} />
      </div>
      <div className="bg-secondary-500 p-6 rounded-3xl min-h-[200px]">
        <span className="font-semibold">Tips</span>
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
