"use client";

import { Dropdown } from "flowbite-react";

export const ProjectSelect = () => {
  return (
    <Dropdown
      label="Untiled entry"
      dismissOnClick={false}
      color="white"
      className="!bg-white"
      size="sm"
      theme={{
        floating: {
          target: "!rounded-full bg-white text-gray-200 focus:ring-0 flex items-center justify-between px-4 py-2",
          base: "z-10 w-fit divide-y divide-gray-100 rounded shadow focus:outline-none",
          content: "py-1 text-sm text-gray-700 dark:text-gray-200",
        },
        inlineWrapper: "flex items-center justify-between w-full",
        arrowIcon: "ml-2 h-4 w-4 self-center",
      }}
    >
      <Dropdown.Item>Dashboard 1</Dropdown.Item>
      <Dropdown.Item>Dashboard 2</Dropdown.Item>
      <Dropdown.Item>Dashboard 3</Dropdown.Item>
      <Dropdown.Item>Dashboard 4</Dropdown.Item>
    </Dropdown>
  );
};
