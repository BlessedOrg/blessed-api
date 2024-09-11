export const getExplorerUrl = (param: string, type: "hash" | "contract"): string => {
  switch (type) {
    case "hash":
      return `https://sepolia.voyager.online/tx/${param}`;
    case "contract":
      return `https://sepolia.voyager.online/contract/${param}`;
  }
};