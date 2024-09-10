const formatToTargetFunctionOutputType = (result, targetFunction) => {
  if (targetFunction.outputs[0].type.includes("ContractAddress")) {
    result = `0x${result.toString(16)}`;
  } else {
    result = result.toString(16);
  }
  return result;
};

const formatCairoFunctionResult = (result, targetFunction) => {
  if (typeof result === "bigint") {
    result = formatToTargetFunctionOutputType(result, targetFunction);
  } else if (typeof result === "object") {
    for (const key in result) {
      if (typeof result[key] === "bigint") {
        result[key] = formatToTargetFunctionOutputType(result[key], targetFunction);
      }
    }
  }
  return result;
};

export default formatCairoFunctionResult;