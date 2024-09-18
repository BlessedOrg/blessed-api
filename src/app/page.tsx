import { HomeDashboard } from "@/components/homeDashboard/HomeDashboard";
import { Navigation } from "@/components/homeDashboard/navigation/Navigation";
import { redirect } from "next/navigation";
import { setCookie } from "cookies-next";

export default function HomePage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  if (!!searchParams?.token) {
    setCookie("accessToken", `${searchParams.token}`);
    redirect("/");
  }
  return (
    <div className="flex w-full flex-col bg-gray-500">
      <Navigation />
      <HomeDashboard />
    </div>
  );
}
