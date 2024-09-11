import Link from "next/link";

export const MobileNav = ({ isOpen }) => {
  return <div className="lg:hidden fixed w-full h-[100dvh] bg-white z-50 left-0 top-[76.36px]" style={{
    transform: `translateX(${isOpen ? "0" : "-100%"})`,
    transition: "transform 0.3s ease"
  }}>
    <div className="mt-10 flex flex-col gap-4 items-center justify-center">
      <Link href={"/"}>Home</Link>
      <Link href={"/about"}>About</Link>
      <Link href={"/pricing"}>Pricing</Link>
      <Link href={"/contact"}>Contact</Link>
    </div>
  </div>;
};