import {decodeContractAddressFromBigInt} from "@/utils/decodeContractAddressFromBigInt";

export function parseEventBigNumber(value: any) {
    return typeof value === "bigint"
        ? `${value}`.length > 20
            ? decodeContractAddressFromBigInt(value)
            : Number(value)
        : value
}