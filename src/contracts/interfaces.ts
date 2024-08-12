import fs from 'fs';
import path from 'path';
import { Abi } from "starknet";

function importAllJsonContractsArtifacts() {
  const dirPath = path.join(process.cwd(), 'src/contracts/artifacts');
  const files = fs.readdirSync(dirPath);
  const jsonObjects: { [key: string]: any } = {};

  files.forEach((file) => {
    if (file.endsWith('.json')) {
      const filePath = path.join(dirPath, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const fileName = path.basename(file, '.json');
      jsonObjects[fileName] = JSON.parse(fileContent);
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
  const functionsInterface = contractsInterfaces[contractName].abi.find(i => i.type === "interface");
  return functionsInterface.items
    .filter((i: any) => i.type === "function")
    .map((i: any) => ({
      name: i.name,
      inputs: i.inputs
    }));
};

export const getContractsConstructor = (contractName: any) => {
  throwErrorForWrongContractId(contractName);
  const constructorInterface = contractsInterfaces[contractName].abi.find((i: any) => i.type === "constructor");
  return constructorInterface.inputs.map((i: any) => i.name);
}

export const contractsInterfaces: ContractsInterfacesType = contractArtifacts as ContractsInterfacesType;
