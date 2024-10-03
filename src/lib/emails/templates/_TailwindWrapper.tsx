import { Tailwind } from "@react-email/components";
import { ReactNode } from "react";

export const _TailwindWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <Tailwind
      // @ts-ignore
      config={{
        theme: {
          extend: {
            colors: {
              green: {
                "50": "#E0FEF0",
                "100": "#B3FCE0",
                "200": "#80FAD0",
                "300": "#4DF9C0",
                "400": "#26F7B0",
                "500": "#06F881",
                "600": "#05C667",
                "700": "#04954E",
                "800": "#037134",
                "900": "#024D1A",
              },
              yellow: {
                "50": "#FFFEF5",
                "100": "#FFFDEB",
                "200": "#FFFBD6",
                "300": "#FFF9C2",
                "400": "#FFF7AD",
                "500": "#FFFACD",
                "600": "#CCB870",
                "700": "#998A54",
                "800": "#665C38",
                "900": "#332E1C",
              },
            },
          },
        },
      }}
    >
      {children}
    </Tailwind>
  );
};
