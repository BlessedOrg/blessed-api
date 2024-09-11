"use client";
import { HeaderTiles } from "@/components/home/header/HeaderTiles";
import { Button } from "flowbite-react";
import Image from "next/image";
import { useRef } from "react";
import { useInView } from "framer-motion";

export const Header = () => {
  const barHeight = 75;
  const headerRef = useRef(null);
  const isInView = useInView(headerRef, { once: false });

  const leftBars = Array.from({ length: 3 }, (_, index) => {
    const top = index * (barHeight * 2) + barHeight;

    return <div
      key={`left-${index}`}
      className={`absolute w-[60%] bg-primary-500 z-[-1]`}
      style={{
        top: `${top}px`,
        left: `${isInView ? 0 : "-100%"}`,
        height: `${barHeight}px`,
        transition: "left 1.5s"
      }}
    ></div>;
  });

  const rightBars = Array.from({ length: 4 }, (_, index) => {
    const top = index * (barHeight * 2);

    return <div
      key={`right-${index}`}
      className={`absolute w-[25%] bg-primary-500 z-[-1]`}
      style={{
        top: `${top}px`,
        height: `${barHeight}px`,
        right: `${isInView ? 0 : "-100%"}`,
        transition: "right 1.5s"
      }}
    ></div>;
  });

  return (
    <header ref={headerRef} className="relative flex flex-col gap-8 items-center py-10 px-4 bg-cover bg-center overflow-x-hidden max-w-[1440px]">
      <p className="text-4xl md:text-7xl uppercase font-bold md:leading-[73px] text-center">
        Build, manage, and distribute <br /> <span className="text-[#FFA500]">Tickets</span> quickly and fairly
      </p>
      <p className="font-bold text-xl text-center mb-12">Start quickly in just three steps with easy integrations…</p>
      <HeaderTiles />
      <Image src={"/img/icons/pacman.svg"} alt="pacman" width={100} height={100} className="absolute left-[1%] bottom-[0px] md:top-[30%]" />

      {leftBars}
      {rightBars}
      <Button pill className="bg-primary-500 hover:!bg-primary-600 text-black">Get started for free</Button>
    </header>
  );
};