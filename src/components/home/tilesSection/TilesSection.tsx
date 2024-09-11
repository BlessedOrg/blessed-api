import Image from "next/image";
import Link from "next/link";

const mediumTiles = [
  {
    title: "Events & festivals",
    description: "Sell and manage tickets with radical transparency and security.",
    image: "/img/icons/party-popper.svg",
    colors: {
      general: "bg-[#FFFACD]",
      button: "border-black text-black"
    },
    button: "View use cases"
  },
  {
    title: "Gaming",
    description: "Issue and manage passes for gaming events and tournaments.",
    image: "/img/icons/pacman.svg",
    colors: {
      general: "bg-black text-white",
      button: "border-white text-white"
    },
    button: "View use cases"
  }
];

export const TilesSection = () => {
  return <div className="flex flex-col gap-4 justify-center py-10 items-center px-4">
    <h2 className="font-bold uppercase text-3xl md:text-6xl text-center">See Blessed in action</h2>
    <p className="text-center">Start with a use-case template and get your project started in minutes.</p>
    <div className="flex flex-col gap-6 items-center justify-center w-full mt-10">
      <div className="flex w-full min-h-[374px] py-6 px-4 md:py-10 md:px-8 bg-[rgba(239,239,239,1)] rounded-[1.5rem] justify-between flex-col gap-6">
        <div className="flex flex-col gap-6 md:flex-row justify-between">
          <div className="flex flex-col gap-4">
            <div className="text-4xl font-bold uppercase">Conferences & meetups</div>
            <div className="text-[xl] font-medium">Effortlessly manage entries for a smooth check-in experience.</div>
          </div>
          <Image src="/img/icons/coffe.svg" alt="Favorite Icon" className="self-center md:self-auto" width={200} height={200} />
        </div>
        <button className="flex w-full md:max-w-[185px] py-[12px] px-[28px] items-center justify-center gap-[8px] border-[2px] border-black text-black bg-transparent rounded-[39px]">
          View use cases
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-6 justify-between w-full">
        {mediumTiles.map((tile, index) => {
          return <div key={tile.title + index} className={`flex flex-col gap-4 w-full-[374px] py-6 px-4 md:py-10 md:px-8  ${tile.colors.general} rounded-[1.5rem] w-full`}>
            <Image src={tile.image} alt="Favorite Icon" width={200} height={200} className="self-center md:self-end" />
            <div className="flex flex-col gap-4 justify-between h-full">
              <div className="flex flex-col gap-2">
                <div className="text-4xl font-bold">{tile.title}</div>
                <div className="text-[xl] font-medium">{tile.description}
                </div>
              </div>
              <Link href={"/"} className={`flex w-full md:max-w-[185px] py-[12px] px-[28px] items-center justify-center gap-[8px] border-[2px] ${tile.colors.button} bg-transparent rounded-[39px]`}>
                {tile.button}
              </Link>
            </div>
          </div>;
        })}
      </div>
    </div>
  </div>;
};