import { default as SampleContract } from "./SampleContract.json";

type ContractsInterfacesType = {
  [key: string]: {
    abi: any;
  };
};

const untypedContractsInterfaces = {
  ["SampleContract"]: SampleContract,
};

export const contractsInterfaces: ContractsInterfacesType = untypedContractsInterfaces as ContractsInterfacesType;

