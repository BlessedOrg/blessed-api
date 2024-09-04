export const getExplorerUrl = (param: string): string => {
  console.log("🌳 param.length: ", param.length)
  return `https://sepolia.voyager.online/contract/${param}`;
  // 🏗️ TODO: figure out address and tx hash length to distinguish
  // if (param.length === 66) {
  //   return `${activeChain.blockExplorers.default.url}/tx/${param}`;
  // } else if (param.length === 42) {
  //   return `${activeChain.blockExplorers.default.url}/address/${param}`;
  // } else {
  //   throw new Error("Invalid input: must be a valid Ethereum address (40 signs) or transaction hash (64 signs)");
  // }
};