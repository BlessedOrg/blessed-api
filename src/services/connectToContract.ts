import provider from "@/contracts/provider";
import { contractsInterfaces } from "@/contracts/interfaces";
import { Contract } from "starknet";

interface ConnectToContractParams {
  address: string;
  id: string;
}

const connectToContract = ({ address, id }: ConnectToContractParams) => {
  return new Contract(contractsInterfaces[id].abi, address, provider);
};

export default connectToContract;
