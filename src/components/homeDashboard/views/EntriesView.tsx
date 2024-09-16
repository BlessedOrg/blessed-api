import { Card } from "@/components/Card";
import { CustomButton } from "@/components/CustomButton";
import Image from "next/image";

const recentEntries = [
  {
    title: "Gaming pass 2025",
    startDate: "August 20, 2024",
    endDate: "September 12, 2024",
    image: "/img/placeholder_image.jpeg",
  },
  {
    title: "Gaming pass 2025",
    startDate: "August 20, 2024",
    endDate: "September 12, 2024",
    image: "/img/placeholder_image.jpeg",
  },
  {
    title: "Gaming pass 2025",
    startDate: "August 20, 2024",
    endDate: "September 12, 2024",
    image: "/img/placeholder_image.jpeg",
  },
];

export const EntriesView = () => {
  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex flex-col gap-4">
        <h2 className="font-semibold text-xl">Recent entries</h2>
        {recentEntries.map((entry, index) => {
          return (
            <Card key={entry.title + index} className="flex gap-4">
              <Image src={entry.image} alt="" width={175} height={99} className="rounded-2xl w-full max-w-[175px] h-[100px] object-cover" />
              <div className="flex flex-col gap-1">
                <div>
                  <p className="text-sm text-gray-200 uppercase font-semibold">Entry Type </p>
                  <h3 className="font-semibold text-lg">{entry.title}</h3>
                </div>
                <p className="text-sm text-gray-200 uppercase font-semibold">
                  Start - End date {entry.startDate} - {entry.endDate}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
      <div className="flex gap-4 justify-center">
        <CustomButton className="bg-transparent border-2 border-black-50 w-fit">See more</CustomButton>
        <CustomButton className="w-fit">Add new entry</CustomButton>
      </div>
    </div>
  );
};
