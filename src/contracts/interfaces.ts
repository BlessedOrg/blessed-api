import fs from "fs";
import path from "path";
import { Abi } from "starknet";
import { isEmpty } from "lodash-es";
import { bigIntToHex, decimalToBigInt } from "@/utils/numberConverts";
import { flattenArray } from "@/utils/flattenArray";
import { cairoInputsFormat } from "@/utils/cairoInputsFormat";

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
    case contractsNames().EntranceContract:
      return "0x06c4389c84919d194bdd0f49d4068c013f9d4b508a9283b5d9ecc39aa02c4961";
    case contractsNames().ERC1155EventTicket:
      return "0x044842b906352c6b7eec7647cbea72b82a7b3505bb64a788f114c99f5d47b2d5";
    case contractsNames().ERC20EventCurrency:
      return "0x009b9c1d9acddafd3da6e0a2d57733f539ef2e5d7cdbb917cef7af6cfc051638";
    case contractsNames().SampleContract:
      return "0x019994ff99f2a22bda55218dc609fe644d977a0581694d1d6a2bd05977376b52";
    default:
      return null;
  }
}

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

type ContractsInterfacesType = {
  [key: string]: {
    abi: Abi;
    sierra_program_debug_info: object,
    contract_class_version: string,
    entry_points_by_type: object,
  };
};

export const throwErrorForWrongContractId = (contractName: any) => {
  if (!contractsInterfaces[contractName]) {
    throw new Error(`Invalid contractName: ${contractName}. Supported contracts can be checked by calling endpoint /api/public/contracts`);
  }
};

export const getContractsFunctions = (contractName: any) => {
  throwErrorForWrongContractId(contractName);
  const abi = contractsInterfaces[contractName].abi;
  const topLevelFunctions = abi.filter(item => item.type === "function");
  const interfaceFunctions = abi
    .filter(item => item.type === "interface")
    .flatMap(interfaceItem => interfaceItem.items.filter(i => i.type === "function"));

  return [...topLevelFunctions, ...interfaceFunctions]
    .map((i: any) => ({
      name: i.name,
      inputs: i.inputs,
      type: i.state_mutability === "view" ? "read" : "write"
    }));
};

export const getReadableContractsFunctions = (contractName: any) => {
  throwErrorForWrongContractId(contractName);
  const functionsInterface = contractsInterfaces[contractName].abi.filter(i => i.type === "interface").flatMap(i => i.items);
  return {
    view: functionsInterface.filter(a => a.state_mutability === "view").map((f) => ({
      name: f.name,
      inputs: cairoInputsFormat(f.inputs)
    })),
    write: functionsInterface.filter(a => a.state_mutability === "external").map((f) => ({
      name: f.name,
      inputs: cairoInputsFormat(f.inputs)
    }))
  };
};

export const getContractsConstructor = (contractName: any) => {
  throwErrorForWrongContractId(contractName);
  const constructorInterface = contractsInterfaces[contractName].abi.find((i: any) => i.type === "constructor");
  return constructorInterface.inputs.map((i: any) => i.name);
};

export const getGaslessTransactionCallData = (
  method: string,
  contractAddress: string,
  body: { [key: string]: any },
  abiFunctions: any[]
) => {
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
export const contractsInterfaces: ContractsInterfacesType = contractArtifacts as ContractsInterfacesType;
