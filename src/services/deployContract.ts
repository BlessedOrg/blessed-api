import { Account, Calldata, CallData } from "starknet";
import { contractsInterfaces, throwErrorForWrongContractId } from "@/contracts/interfaces";
import provider from "@/contracts/provider";

interface DeployContractParams {
  contractName: string;
  constructorArgs: { [key: string]: any };
  classHash: string;
}

const deployContract = async ({ contractName, constructorArgs, classHash }: DeployContractParams) => {
  throwErrorForWrongContractId(contractName);
  const account = new Account(provider, process.env.OPERATOR_WALLET_ADDR as string, process.env.OPERATOR_PRIVATE_KEY as string);
  const contractCallData: CallData = new CallData(contractsInterfaces[contractName].abi as any);
  const contractConstructor: Calldata = contractCallData.compile("constructor", constructorArgs);
  const deployResponse = await account.deployContract({
    classHash: classHash,
    constructorCalldata: contractConstructor,
  });
  const txRes = await provider.waitForTransaction(deployResponse.transaction_hash);

  if (txRes.isSuccess()) {
    const fee = parseInt((txRes as any)?.actual_fee?.amount, 16);
    console.log(`📜 Newly deployed ${contractName} Contract with address: ${deployResponse.contract_address}`);
    return {
      ...deployResponse,
      fee,
      status: "success"
    };
  } else {
    console.error(`❌ Deploy ${contractName} failed:`, txRes);
    return {
      status: "failed",
      ...deployResponse,
      confirmationResponse: txRes
    };
  }
};

export default deployContract;
