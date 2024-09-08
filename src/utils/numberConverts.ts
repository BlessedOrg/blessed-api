export const bigIntToHex = (value: BigInt) => "0x" + Number(value).toString(16);

export const decimalToBigInt = (value: number) => BigInt(value * 10 ** 18);
