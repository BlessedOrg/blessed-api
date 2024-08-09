import provider from "@/contracts/provider";
import { contractsInterfaces } from "@/contracts/interfaces";
import { Contract } from "starknet";

interface ConnectToContractParams {
  address: string;
  name: string;
}

const connectToContract = ({ address, name }: ConnectToContractParams) => {
  return new Contract(contractsInterfaces[name].abi, address, provider);
};

export default connectToContract;
