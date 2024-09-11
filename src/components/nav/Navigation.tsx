"use client";
import Image from "next/image";
import { Button, Dropdown } from "flowbite-react";
import Link from "next/link";
import { GiHamburgerMenu } from "react-icons/gi";
import { useState } from "react";
import { MobileNav } from "@/components/nav/MobileNav";
import { GrClose } from "react-icons/gr";

export const Navigation = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const onNavToggle = () => {
    setIsMobileNavOpen(prev => !prev);
  }
  return <nav className="py-5 lg:py-8 px-4 lg:px-6 flex justify-between w-full">
    <Image src={"/logo.svg"} alt="logo blessed" height={36} width={100} className="w-[100px] h-auto" />

    <div className="gap-4 items-center hidden lg:flex">
      <Dropdown label="Product" inline>
        <Dropdown.Item>Dashboard</Dropdown.Item>
        <Dropdown.Item>Settings</Dropdown.Item>
        <Dropdown.Item>Earnings</Dropdown.Item>
      </Dropdown>

      <Dropdown label="Resources" inline>
        <Dropdown.Item>Dashboard</Dropdown.Item>
        <Dropdown.Item>Settings</Dropdown.Item>
        <Dropdown.Item>Earnings</Dropdown.Item>
      </Dropdown>

      <Link href={"/pricing"}>Pricing</Link>
    </div>

    <div className="lg:flex gap-4 items-center hidden">
      <Link href={"/docs"} className="text-md">Docs</Link>
      <button className="text-md">Log in</button>
      <Button pill className="text-black bg-primary-500 hover:!bg-primary-600 !font-bold">Start for free</Button>
    </div>

    <button onClick={onNavToggle} className="lg:hidden text-2xl">{isMobileNavOpen ? <GrClose />: <GiHamburgerMenu />}</button>

    <MobileNav isOpen={isMobileNavOpen}/>
  </nav>;
};