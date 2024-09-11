"use client";

import { useState } from "react";
import Image from "next/image";

const tabs = [
  {
    id: 0,
    title: "Developer API",
    content: <div>1</div>
  },
  {
    id: 1,
    title: "Analytics",
    content: <div>2</div>
  },
  {
    id: 2,
    title: "Fee management",
    content: <div>3</div>
  },
  {
    id: 3,
    title: <span>Lotteries & auction <span className="text-gray-400">(cooming soon)</span></span>,
    content: <div>4</div>,
    disabled: true
  }
];
export const TabsSection = () => {
  const [activeTab, setActiveTab] = useState(0);
  const onTabClick = (id: number) => setActiveTab(id);

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  const barHeight = 75;
  const rightBars = Array.from({ length: 4 }, (_, index) => {
    const bottom = index * (barHeight * 2) + barHeight;

    return <div
      key={`left-${index}`}
      className={`absolute right-0 w-[25%] bg-[#FFFACD] z-0`}
      style={{
        bottom: `${bottom}px`,
        height: `${barHeight}px`
      }}
    ></div>;
  });

  return <div className="relative w-full bg-gradient-to-r my-5 from-[#FFFACD] to-[#EFEFEF] py-[80px] px-4 flex flex-col items-center gap-8">
    <h2 className="font-bold uppercase text-3xl md:text-6xl text-center">Why you'll love blessed</h2>
      <div className="flex rounded-full p-2 bg-white overflow-x-auto w-[340px] md:w-fit">
        {tabs.map(tab => {
          const isActive = tab.id === activeTab;
          return (
            <button
              disabled={!!tab.disabled}
              key={tab.id}
              onClick={() => onTabClick(tab.id)}
              className={`min-w-fit disabled:cursor-no-drop text-sm font-semibold px-4 py-2 rounded-full ${
                isActive ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              {tab.title}
            </button>
          );
        })}
      </div>
    <p className="text-center">Build and customize your tickets in just 5 minutes. Integration takes under 1 minute.</p>
    <div className="relative z-10 min-h-[500px] lg:min-h-[600px] bg-white w-full max-w-[800px] flex flex-col items-center p-4">
      <Image src={"/logo.svg"} alt="logo blessed" height={36} width={100} className="w-[100px] h-auto" />
      {activeTabContent}
    </div>
    {rightBars}
  </div>;
};