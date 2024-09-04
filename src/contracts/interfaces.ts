import fs from "fs";
import path from "path";
import { Abi } from "starknet";
import { isEmpty } from "lodash-es";
import { bigIntToHex, decimalToBigInt } from "@/utils/numberConverts";
import { flattenArray } from "@/utils/flattenArray";
import { cairoInputsFormat } from "@/utils/cairoInputsFormat";

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

  contractNames.forEach((item, index) => {
    obj[item] = item;
  });

  return obj;
}

export function getContractClassHash(name: string) {
  switch (name) {
    case contractsNames().EntranceChecker:
      return "0x06c4389c84919d194bdd0f49d4068c013f9d4b508a9283b5d9ecc39aa02c4961";
    case contractsNames().ERC1155EventTicket:
      return "0x0790fdd260610ef786b80a31603129054a2b8925d1f3ed4bf5efdf2f3a7321fb";
    case contractsNames().ERC20EventCurrency:
      return "0x009b9c1d9acddafd3da6e0a2d57733f539ef2e5d7cdbb917cef7af6cfc051638";
    default:
      throw new Error(`Provide class hash for the contract ${name}! It is stored in the artifacts folder but the class hash is missing, therefore it cannot be deployed.`);
  }
}

const getContractDescription = (contractName: string) => {
  switch (contractName) {
    case contractsNames().EntranceChecker:
      return "🚨 FIlL THIS OUt";
    case contractsNames().ERC1155EventTicket:
      return "Multi-token standard for creating 'tickets on steroids'. Can be limited to whitelisted marketplaces, collect royalties on the secondary market, used for fan rewards & perks, kill bots  and offer endless  advanced functionality beyond traditional ticketing systems.";
    case contractsNames().ERC20EventCurrency:
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
      name: i.name,
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
      }

      availableContracts.push(contractDetails);
    }
  });
  return availableContracts;
}

interface GetGaslessTransactionCallDataArgs {
  method: string;
  contractAddress: string;
  body: { [key: string]: any };
  abiFunctions: any[];
}

export const getGaslessTransactionCallData = ({ method, contractAddress, body, abiFunctions }: GetGaslessTransactionCallDataArgs) => {
  const inputs = abiFunctions.find((m) => m.name === method).inputs;
  if (isEmpty(inputs)) {
    return [];
  } else {
    const formattedInputs = inputs.map((input) => {
      if (input.type.includes("integer::u256")) {
        return [bigIntToHex(decimalToBigInt(body[input.name])), "0x0"];
      }
      return body[input.name];
    });
    const calldata = flattenArray(formattedInputs);
    return [
      {
        entrypoint: method,
        contractAddress,
        calldata
      }
    ];
  }
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
