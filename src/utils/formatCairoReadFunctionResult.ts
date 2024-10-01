import { uint256 } from "starknet";
import { extractCairoArraySingleTypes } from "@/utils/extractCairoArraySingleTypes";

const formatCairoTypeVariableToReadable = (value, type: string) => {
  if (type.includes("core::array::Array::<")) {
    const arrayTypes = extractCairoArraySingleTypes(type);
    return value.map((item) => {
      const itemValues = Object.values(item);
      return itemValues.map((i, index) => formatCairoTypeVariableToReadable(i, arrayTypes[index]));
    });
  }
  if (type.includes("felt252")) {
    const uint = uint256.bnToUint256(value);
    const hexString = uint256.uint256ToBN(uint).toString(16);
    const trimmedHexString = hexString.replace(/^0+/, "");
    const asciiString = Buffer.from(trimmedHexString, "hex").toString("ascii");
    return asciiString.replace(/\0/g, "");
  }
  if (type.includes("contract_address")) {
    return `0x${value.toString(16)}`;
  }
  if (type.includes("integer")) {
    const uint = uint256.bnToUint256(value);
    return uint256.uint256ToBN(uint).toString(10);
  }
  return value;
};

const formatCairoReadFunctionResult = (result, targetFunction) => {
  const targetFunctionOutputType = targetFunction.outputs[0].type;
  return formatCairoTypeVariableToReadable(result, targetFunctionOutputType);
};

export { formatCairoReadFunctionResult };
