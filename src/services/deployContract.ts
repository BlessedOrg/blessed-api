import { Account, Calldata, CallData, Provider } from "starknet";
import { contractsInterfaces } from "@/contracts/interfaces";

interface DeployContractParams {
  contractId: string;
  constructorArgs: { [key: string]: any };
  classHash: string;
}

const deployContract = async ({ contractId, constructorArgs, classHash }: DeployContractParams) => {
  if (!contractsInterfaces[contractId]) {
    throw new Error(`Invalid contractId: ${contractId}. Supported contracts can be checked by calling endpoint /api/public/contracts`);
  }
  const provider = new Provider();
  const account = new Account(provider, process.env.WALLET_ADDR as string, process.env.PRIVATE_KEY as string);
  const contractCallData: CallData = new CallData(contractsInterfaces[contractId].abi as any);
  const contractConstructor: Calldata = contractCallData.compile("constructor", constructorArgs);
  const deployResponse = await account.deployContract({
    classHash: classHash,
    constructorCalldata: contractConstructor,
  });
  await provider.waitForTransaction(deployResponse.transaction_hash);
  console.log("📜 Newly deployed contract address:", deployResponse.contract_address);
  return deployResponse;
};

export default deployContract;
