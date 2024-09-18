import { Card } from "@/components/Card";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { ChevronRight, Plus } from "lucide-react";

interface TemplateCardProps {
  name: string;
  description: string | ReactNode;
  image: string;
  href: string;
  linkLabel?: string;
  style?: string;
}
export const TemplateCard = ({ name, description, image, linkLabel, style }: TemplateCardProps) => {
  return (
    <Card className={`border-2 border-black xl:max-w-[241px] w-full flex flex-col gap-4 ${style || ""}`}>
      <div className="flex gap-2 justify-between items-center">
        <Image src={image} alt={name} width={40} height={40} />
        <button className="bg-gray-500 rounded-full p-2">
          <Plus size={24} />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-sm line-clamp-3 overflow-hidden text-ellipsis">{description}</p>
      </div>
      <div className="flex gap-1 items-center">
        <Link href={"/"} className="font-semibold">
          {linkLabel || "More ticket insights"}
        </Link>
        <ChevronRight size={28} />
      </div>
    </Card>
  );
};
