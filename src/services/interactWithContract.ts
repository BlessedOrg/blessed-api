import { isEmpty } from "lodash-es";

const interactWithContract = async (body: any, contract: any) => {
  let result;
  if (isEmpty((body as any)?.data?.inputs)) {
    result = await contract[body?.data?.functionName]();
  } else {
    result = await contract[body?.data?.functionName](body?.data?.inputs);
  }
  if (typeof result === "bigint") {
    result = result.toString();
  }
  return result;
};

export default interactWithContract;
