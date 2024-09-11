import { isEmpty } from "lodash-es";
import {Contract} from "starknet";

const interactWithContract = async (functionName: string, inputs: any[], contract: Contract) => {
  let result;
  if (isEmpty(inputs)) {
    result = await contract[functionName]();
  } else {
    result = await contract[functionName](...inputs);
  }
  if (typeof result === "bigint") {
    result = result.toString();
  }
  return result;
};

export default interactWithContract;
