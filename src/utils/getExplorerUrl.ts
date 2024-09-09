export const getExplorerUrl = (param: string): string => {
  if (param.length === 65) {
    return `https://sepolia.voyager.online/tx/${param}`;
  } else {
    return `https://sepolia.voyager.online/contract/${param}`;
  }
};