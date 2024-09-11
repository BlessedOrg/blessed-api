"use client";
import { useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const tiles = [
  {
    title: "Create",
    description: "Pick your entry type and begin via our UI or API",
    image: "/img/icons/heart.svg"
  },
  {
    title: "Customize",
    description: "Fine tune to your liking easily as a piece of cake",
    image: "/img/icons/cake.svg"
  },
  {
    title: "Publish",
    description: "Publish and go live ASAP",
    image: "/img/icons/rocket.svg"
  }
];

export const HeaderTiles = () => {
  const isMobile = useMediaQuery(768)
  const { scrollY } = useScroll();
  const [adjustedScrollY, setAdjustedScrollY] = useState(50);

  useEffect(() => {
    const unsubscribe = scrollY.onChange((latest) => {
      const scrollPercentage = Math.min(latest / 1000 * 100, 100);
      const adjusted = 50 - ((scrollPercentage / (isMobile ? 30 : 25) * 50));
      setAdjustedScrollY(Math.max(-20, Math.min(50, adjusted)));
    });
    return () => unsubscribe();
  }, [scrollY]);


  return <div className="flex gap-4" style={{
    transform: `translateX(calc(${adjustedScrollY}% - ${isMobile ? "150px": "300px"}))`,
    transition: "all 100ms"
  }}>
    {tiles.map((tile, index) => {
      return <div key={tile.title} className="w-[253px] md:w-[598px] h-[336px] md:h-[200px] bg-gradient-to-r from-[#06F881] to-[#FFFACD] p-4">
        <div className="flex gap-4 flex-col bg-white p-4 w-full h-full ">
          <div className="flex flex-col-reverse md:flex-row md:justify-between gap-2">
            <div className="flex flex-col gap-2 font-bold text-2xl md:text-3xl">
              <p>{index + 1}</p>
              <p>{tile.title}</p>
            </div>
            <Image
              width={100}
              height={100}
              src={tile.image}
              alt=""
            />
          </div>
          <p className="text-sm md:text-lg">{tile.description}</p>
        </div>
      </div>;
    })}
  </div>;
};