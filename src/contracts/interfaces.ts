import fs from "fs";
import path from "path";
import { Abi, Contract, GetTransactionReceiptResponse } from "starknet";
import { cairoInputsFormat } from "@/utils/cairoInputsFormat";
import { EventsPerFunctionName } from "@/app/api/public/[contractName]/[usersContractVersion]/[functionName]/route";
import { formatParsedEventsArray } from "@/utils/contractEvents/formatParsedEventsArray";
import { getTargetEventData } from "@/utils/contractEvents/getTargetEventData";

function importAllJsonContractsArtifacts() {
  const dirPath = path.join(process.cwd(), "src/contracts/artifacts");
  const files = fs.readdirSync(dirPath);
  const jsonObjects: { [key: string]: any } = {};

  files.forEach((file) => {
    if (file.endsWith(".json")) {
      const filePath = path.join(dirPath, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const fileName = path.basename(file, ".json");
      jsonObjects[fileName] = JSON.parse(fileContent);
      const classHash = getContractClassHash(fileName);
      if (!classHash) {
        throw new Error(`Provide class hash for the contract ${fileName}! It is stored in the artifacts folder but the class hash is missing, therefore it cannot be deployed.`);
      }
    }
  });
  return jsonObjects;
}

const contractArtifacts = importAllJsonContractsArtifacts();

export function contractsNames() {
  type ContractNames = Record<string, string>;
  const dirPath = path.join(process.cwd(), "src/contracts/artifacts");
  const files = fs.readdirSync(dirPath);
  const contractNames = [];

  files.forEach((file) => {
    if (file.endsWith(".json")) {
      contractNames.push(path.basename(file, ".json"));
    }
  });

  const obj: ContractNames = {};

  contractNames.forEach((item) => {
    obj[item] = item;
  });


  return obj;
}

export function getContractClassHash(name: string) {
  switch (name) {
    case contractsNames().entrance_checker:
      return "0x037059dd76cb7df102862b83cb07e338c084c38c2eef707e1700892c8aaac83c";
    case contractsNames().ticket:
      return "0x02faf6dce6e57f51815a5d688304a26357fba76cdddabef104cb1237304d22b6";
    case contractsNames().token:
      return "0x009b9c1d9acddafd3da6e0a2d57733f539ef2e5d7cdbb917cef7af6cfc051638";
    default:
      throw new Error(`Provide class hash for the contract ${name}! The contract is stored in the artifacts folder, but the class hash is missing, therefore it cannot be deployed.`);
  }
}

const getContractDescription = (contractName: string) => {
  switch (contractName) {
    case contractsNames().entrance_checker:
      return "🚨 FIlL THIS OUt";
    case contractsNames().ticket:
      return "Multi-token standard for creating 'tickets on steroids'. Can be limited to whitelisted marketplaces, collect royalties on the secondary market, used for fan rewards & perks, kill bots  and offer endless  advanced functionality beyond traditional ticketing systems.";
    case contractsNames().token:
      return "Token standard for creating in-house, event-specific, or in-app currencies. Ideal for community building and native event payments, enhancing user engagement and providing a seamless transaction experience within our ecosystem.";
    default:
      throw new Error(`Provide description for the contract ${contractName}!`);
  }
};

export const getContractsFunctions = (contractName: any, convertFunctionTypesFromCairo = false) => {
  throwErrorForWrongContractName(contractName);
  const abi = contractsInterfaces[contractName].abi;
  const topLevelFunctions = abi
    .filter(item => item.type === "function");
  const interfaceFunctions = abi
    .filter(item => item.type === "interface")
    .flatMap(interfaceItem => interfaceItem.items.filter(i => i.type === "function"));

  const allFunctions = [...topLevelFunctions, ...interfaceFunctions];

  return allFunctions
    .map((i: any) => ({
      ...i,
      inputs: convertFunctionTypesFromCairo ? cairoInputsFormat(i.inputs) : i.inputs,
      type: i.state_mutability === "view" ? "read" : "write"
    }));
};

export const getContractsConstructorsNames = (contractName: any) => {
  throwErrorForWrongContractName(contractName);
  const constructorInterface = contractsInterfaces[contractName].abi.find((i: any) => i.type === "constructor");
  return constructorInterface.inputs.map((i: any) => i.name);
};

export const getAllContractsDetails = () => {
  const dirPath = path.join(process.cwd(), "src/contracts/artifacts");
  const files = fs.readdirSync(dirPath);
  const availableContracts = [];

  files.forEach((file) => {
    if (file.endsWith(".json")) {
      const filePath = path.join(dirPath, file);
      const fileContent = fs.readFileSync(filePath, "utf-8"); // leave it if we want to add ABI or sierra_compile
      const fileName = path.basename(file, ".json");
      const contractName = contractsNames()[fileName];
      throwErrorForWrongContractName(contractName);

      const contractDetails = {
        name: contractName,
        description: getContractDescription(fileName),
        classHash: getContractClassHash(fileName),
        url: `https://github.com/BlessedOrg/blessed-contracts-cairo/blob/master/${fileName}`,
        constructor: cairoInputsFormat(contractsInterfaces[contractName].abi.find((i: any) => i.type === "constructor").inputs),
        functions: getContractsFunctions(fileName, true)
      };

      availableContracts.push(contractDetails);
    }
  });
  return availableContracts;
};

export const throwErrorForWrongContractName = (contractName: any) => {
  if (!contractsInterfaces[contractName]) {
    throw new Error(`Invalid contractName: ${contractName}. Supported contracts can be checked by calling endpoint /api/public/contracts`);
  }
};

type ContractsInterfacesType = {
  [key: string]: {
    abi: Abi;
    sierra_program_debug_info: object,
    contract_class_version: string,
    entry_points_by_type: object,
  };
};

export const contractsInterfaces: ContractsInterfacesType = contractArtifacts as ContractsInterfacesType;

interface IContractOutputProps {
  eventsPerFunctionName: EventsPerFunctionName;
  contract: Contract;
  txReceipt: GetTransactionReceiptResponse;
  functionName: string;
}
interface IOuputEvent {
  events: { eventName: string; [key: string]: string }[];
  txReceipt: GetTransactionReceiptResponse;
  targetEventValues: { [key: string]: string };
}
export const getContractOutput = ({
  eventsPerFunctionName,
  functionName,
  contract,
  txReceipt,
}: IContractOutputProps): IOuputEvent & {[ket: string]: any} => {
  const parsedEvents = contract.parseEvents(txReceipt);

  const eventsToParse = eventsPerFunctionName[functionName];
  let targetEventValues = {};
  if (!!eventsToParse && !!txReceipt) {
    for (const event of eventsToParse) {
      const targetValue = getTargetEventData(
        event.eventName,
        parsedEvents,
        event.value,
      );
      if (!!targetValue) {
        targetEventValues[event?.saveValue || event.value] = targetValue;
      }
    }
  }

  return {
    events: formatParsedEventsArray(parsedEvents),
    txReceipt,
    targetEventValues,
  };
};
