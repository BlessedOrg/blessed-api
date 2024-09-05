import {decodeWalletAddressFromBigInt} from "@/utils/decodeWalletAddressFromBigInt";

export function parseEventBigNumber(value: any) {
    return typeof value === "bigint"
        ? `${value}`.length > 20
            ? decodeWalletAddressFromBigInt(value)
            : Number(value)
        : value
}