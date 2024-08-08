import { isEmpty } from "lodash-es";

const parseContractResponse = async (parsedBody: any, contract: any) => {
  let result;
  if (isEmpty((parsedBody as any)?.data?.inputs)) {
    result = await contract[parsedBody?.data?.functionName]();
  } else {
    result = await contract[parsedBody?.data?.functionName](parsedBody?.data?.inputs);
  }
  if (typeof result === "bigint") {
    result = result.toString();
  }
  return result;
};

export default parseContractResponse;
