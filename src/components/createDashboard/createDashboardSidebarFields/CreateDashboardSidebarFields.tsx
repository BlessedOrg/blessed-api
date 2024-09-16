import Link from "next/link";
import { useRouter } from "next/navigation";
import { createDashboardSidebarCategoriesAndFields } from "./createDashboardSidebarCategoriesAndFields";
import Image from "next/image";
export const CreateDashboardSidebarFields = ({ selectedCategory, selectedTab }) => {
  const router = useRouter();
  return (
    <div className={`xl:sticky xl:top-[6.25rem] xl:h-[calc(100vh-6.25rem)] xl:min-w-[20rem]`}>
      <div className="flex flex-col gap-4 w-full">
        {createDashboardSidebarCategoriesAndFields.map((category, index) => {
          return (
            <div
              key={category.id}
              className={`bg-gradient-to-r ${category.id === selectedCategory ? "from-primary-500 to-secondary-500" : "from-white to-secondary-500 cursor-pointer"} p-4`}
              onClick={
                selectedCategory !== category.id
                  ? () => {
                    router.replace(
                      `/create?category=${category.id}&tab=${category.tabs.find((tab) => tab.primary).href}`
                    );
                  }
                  : null
              }
            >
              <div className="w-full h-full bg-white pb-2">
                <div className="flex flex-col gap-2 p-4">
                  <div className="flex gap-2 justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <Image src={category.icon} alt="heart icon" width={24} height={24} />
                      <h2 className="font-semibold">{category.name}</h2>
                    </div>
                    <span className="font-semibold text-xl">{index + 1 + "/" + createDashboardSidebarCategoriesAndFields.length}</span>
                  </div>
                  <p>{category.description}</p>
                </div>
                <ul
                  className={`${selectedCategory === category.id ? "min-h-fit" : "max-h-0 overflow-hidden"}`}
                  style={{
                    transition: "all 250ms",
                  }}
                >
                  {category.tabs.map((tab) => (
                    <li
                      key={tab.href}
                      className={`w-full font-semibold ${selectedTab === tab.href ? "bg-gray-500" : ""}`}
                    >
                      <Link href={`/create?category=${category.id}&tab=${tab.href}`} className="px-4 py-2 inline-block w-full">{tab.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
      );
      };
