const formatCairoFunctionResult = (result, targetFunction) => {
  if (typeof result === "bigint") {
    if (targetFunction.outputs[0].type.includes("ContractAddress")) {
      result = `0x${result.toString(16)}`;
    } else {
      result = result.toString(16);
    }
  } else if (typeof result === "object") {
    for (const key in result) {
      if (typeof result[key] === "bigint") {
        result[key] = result[key].toString();
      }
    }
  }

  return result;
};

export default formatCairoFunctionResult;