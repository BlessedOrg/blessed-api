export const bigIntToHex = (value: BigInt) =>
  "0x" + Number(value).toString(16);

export const decimalToBigIntWithExtraDigits = (value: number, digits?: number) =>
  BigInt(value * 10 ** (digits || 18));
