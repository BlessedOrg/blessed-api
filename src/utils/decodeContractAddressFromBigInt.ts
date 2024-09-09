export function decodeContractAddressFromBigInt(bigIntValue: bigint): string {
  let hexString = bigIntValue.toString(16);
  return "0x" + hexString;
}