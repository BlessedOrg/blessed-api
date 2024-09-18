"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ApiKeyTab } from "@/components/appDashboard/tabs/ApiKeyTab";
import { NameAndDescriptionTab } from "@/components/appDashboard/tabs/NameAndDescriptionTab";
import { Card } from "@/components/Card";

const paramsIndexPerId = {
  "api-key": 0,
  "name-and-description": 1,
  "create-ticket": 2,
  "create-token": 3,
  "nfc-configuration": 4,
  "my-events": 5,
  "my-tokens": 6,
  settings: 7,
};

const contentPerTab = {
  0: <ApiKeyTab />,
  1: <NameAndDescriptionTab />,
  2: <Card className="w-full h-fit" />,
  3: <Card className="w-full h-fit" />,
  4: <Card className="w-full h-fit" />,
  5: <Card className="w-full h-fit" />,
  6: <Card className="w-full h-fit" />,
  7: <Card className="w-full h-fit" />,
};
export const AppDashboardContent = ({ currentTabIndex, onTabChange }) => {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "name-and-description";

  useEffect(() => {
    const activeTabIndex = paramsIndexPerId[currentTab];
    onTabChange(activeTabIndex);
  }, [currentTab]);

  return contentPerTab[currentTabIndex];
};
