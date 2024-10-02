// import { Account, cairo, Calldata, CallData } from "starknet";
// import { contractsInterfaces, throwErrorForWrongContractName } from "@/contracts/cairo/interfaces";
// import provider from "@/contracts/cairo/provider";
// import { getExplorerUrl } from "@/utils/getExplorerUrl";
//
// interface DeployContractParams {
//   contractName: string;
//   constructorArgs: { [key: string]: any };
//   classHash: string;
// }
//
// const deployContract = async ({ contractName, constructorArgs, classHash }: DeployContractParams) => {
//   throwErrorForWrongContractName(contractName);
//   const account = new Account(provider, process.env.OPERATOR_WALLET_ADDR as string, process.env.OPERATOR_PRIVATE_KEY as string);
//   const contractCallData: CallData = new CallData(contractsInterfaces[contractName].abi as any);
//
//   // 🏗️ TODO: move it to separate fn - overwriteConstructor or sth like that
//   let finalArgs = constructorArgs;
//   if (contractName === "ticket") {
//     finalArgs = {
//       ...constructorArgs,
//       royalties_receivers: constructorArgs.royalties_receivers.map((item: any) => {
//         return cairo.tuple(item[0], item[1])
//       })
//     }
//   }
//
//   const contractConstructor: Calldata = contractCallData.compile("constructor", finalArgs);
//
//   const deployResponse = await account.deployContract({
//     classHash: classHash,
//     constructorCalldata: contractConstructor,
//   });
//   const txRes = await provider.waitForTransaction(deployResponse.transaction_hash);
//
//   if (txRes.isSuccess()) {
//     const fee = parseInt((txRes as any)?.actual_fee?.amount, 16);
//     console.log(`⛓️️📜 ${contractName} deployed: ${getExplorerUrl(deployResponse.contract_address, "contract")}`);
//     return {
//       ...deployResponse,
//       fee,
//       status: "success"
//     };
//   } else {
//     console.error(`❌ Deploy ${contractName} failed:`, txRes);
//     return {
//       status: "failed",
//       ...deployResponse,
//       confirmationResponse: txRes
//     };
//   }
// };
//
// export default deployContract;
