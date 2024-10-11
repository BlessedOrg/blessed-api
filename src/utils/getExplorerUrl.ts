const baseUrl = "https://explorer.sketchpad-1.forma.art"

export const getExplorerUrlForma = (param: string, type: "hash" | "contract"): string => {
  switch (type) {
    case "hash":
      return `${baseUrl}/tx/${param}`;
    case "contract":
      return `${baseUrl}/address/${param}`;
  }
};