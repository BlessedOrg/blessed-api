import provider from "@/contracts/cairo/provider";
import { contractsInterfaces } from "@/contracts/cairo/interfaces";
import { Contract } from "starknet";

interface ConnectToContractParams {
  address: string;
  name: string;
}

const connectToContract = ({ address, name }: ConnectToContractParams): Contract => {
  return new Contract(contractsInterfaces[name].abi, address, provider);
};

export default connectToContract;
