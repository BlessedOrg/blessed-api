export function decodeWalletAddressFromBigInt(bigIntValue: bigint): string {
    let hexString = bigIntValue.toString(16);
    hexString = hexString.padStart(64, "0");
    return "0x" + hexString;
}