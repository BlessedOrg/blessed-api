import Link from "next/link";
import Image from "next/image";
import { CustomButton } from "@/components/CustomComponents";
import { MobileNavigation } from "@/components/homeDashboard/navigation/MobileNavigation";
import { ProjectSelect } from "@/components/createDashboard/createDashboardNav/ProjectSelect";

export const AppDashboardNav = () => {
  return (
    <nav className="flex justify-between w-full py-6 bg-gray-500 px-6 sticky top-0 left-0 right-0 z-20">
      <div className="flex gap-2">
        <Link href={"/"} className="p-2 rounded-full bg-white h-[3.25rem] flex items-center justify-center">
          <Image src={"/logo-small.svg"} alt="logo blessed" width={36} height={36} className="h-[36px]" />
        </Link>
        <ProjectSelect />
      </div>
      <div className="flex gap-2">
        <CustomButton className="bg-white">App</CustomButton>
        <CustomButton className="bg-transparent">Analyze</CustomButton>
      </div>
      <Image
        alt=""
        height="52"
        referrerPolicy="no-referrer"
        src="/img/placeholder_avatar.png"
        width="52"
        className="h-button w-[52px] rounded-full"
      />
      <MobileNavigation />
    </nav>
  );
};
