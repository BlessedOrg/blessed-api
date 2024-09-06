export const bigIntToHex = (value: BigInt) => {
  const decimalNumber = Number(value);
  const hexNumber = "0x" + decimalNumber.toString(16);
  return hexNumber;
};

export const decimalToBigInt = (value: number) => {
  return BigInt(value * 10 ** 18);
};

export const decimalToBigIntWithExtraDigits = (
  value: number,
  digits?: number,
) => {
  return BigInt(value * 10 ** (digits || 18));
};
