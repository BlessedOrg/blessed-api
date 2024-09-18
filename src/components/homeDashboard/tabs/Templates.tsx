import { TemplateCard } from "../views/TemplateCard";

const templates = [
  {
    id: 1,
    name: "Template A",
    description:
      "Template tailored for relaxed professional and academic conferences. Plates tailored for professional and academic conferences.",
    image: "/img/icons/coffe.svg",
    href: "/",
  },
  {
    id: 2,
    name: "Template B",
    description:
      "Template tailored for relaxed professional and academic conferences. Plates tailored for professional and academic conferences.",
    image: "/img/icons/coffe.svg",
    href: "/",
  },
  {
    id: 3,
    name: "Template C",
    description:
      "Template tailored for relaxed professional and academic conferences. Plates tailored for professional and academic conferences.",
    image: "/img/icons/party-popper.svg",
    href: "/",
  },
  {
    id: 4,
    name: "Template D",
    description:
      "Template tailored for relaxed professional and academic conferences. Plates tailored for professional and academic conferences.",
    image: "/img/icons/party-popper.svg",
    href: "/",
  },
  {
    id: 5,
    name: "Template E",
    description:
      "Template tailored for relaxed professional and academic conferences. Plates tailored for professional and academic conferences.",
    image: "/img/icons/party-popper.svg",
    href: "/",
  },
  {
    id: 6,
    name: "Template F",
    description:
      "Template tailored for relaxed professional and academic conferences. Plates tailored for professional and academic conferences.",
    image: "/img/icons/pacman.svg",
    href: "/",
  },
  {
    id: 7,
    name: "Template G",
    description:
      "Template tailored for relaxed professional and academic conferences. Plates tailored for professional and academic conferences.",
    image: "/img/icons/pacman.svg",
    href: "/",
  },
  {
    id: 8,
    name: "Template H",
    description:
      "Template tailored for relaxed professional and academic conferences. Plates tailored for professional and academic conferences.",
    image: "/img/icons/pacman.svg",
    href: "/",
  },
];

export const Templates = () => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid place-items-center grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-4 w-full">
        <TemplateCard
          name="Your own"
          description={
            <span>
              <span className="font-semibold">Unlock more power!</span>
              <br /> You{"’"}ve mastered ticketing. Ready to go further?
            </span>
          }
          image="/img/icons/lock.svg"
          href="/"
          linkLabel="Contact us"
          style="!bg-secondary-500"
        />
        {templates.map((template) => {
          return <TemplateCard key={template.id} {...template} />;
        })}
      </div>
    </div>
  );
};
