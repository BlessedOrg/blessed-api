import { isEmpty } from "lodash-es";
import {Contract} from "starknet";

const interactWithContract = async (functionName: string, inputs: any[], contract: Contract) => {
  let result;
  if (isEmpty(inputs)) {
    result = await contract[functionName]();
  } else if(inputs.length === 1) {
    result = await contract[functionName](inputs[0]);
  }else {
    result = await contract[functionName](inputs);
  }
  if (typeof result === "bigint") {
    result = result.toString();
  }
  return result;
};

export default interactWithContract;
