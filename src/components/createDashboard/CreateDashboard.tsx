"use client";

import { useSearchParams } from "next/navigation";
import { DashboardSidebar } from "../homeDashboard/DashboardSidebar";
import { CreateDashboardSidebarFields } from "./createDashboardSidebarFields/CreateDashboardSidebarFields";
import { CreateDashboardContent } from "@/components/createDashboard/createDashboardContent/CreateDashboardContent";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schema } from "@/components/createDashboard/createDashboardContent/schema";
import { useEffect } from "react";

export const CreateDashboard = () => {
  const selectedCategory = useSearchParams().get("category") || "setup";
  const selectedTab = useSearchParams().get("tab") || "name-and-description";

  const form = useForm({
    resolver: zodResolver(schema),
  });
  const {
    watch,
    formState: { errors },
  } = form;

  const currentData = watch();

  useEffect(() => {
    console.log(currentData);
  }, [currentData]);

  return (
    <main className="flex xl:flex-row flex-col-reverse md:flex-col gap-6 w-full px-[1.5rem] max-w-[90rem] self-center">
      <CreateDashboardSidebarFields selectedCategory={selectedCategory} selectedTab={selectedTab} />
      <CreateDashboardContent form={form} selectedTab={selectedTab} />
      <DashboardSidebar />
    </main>
  );
};
