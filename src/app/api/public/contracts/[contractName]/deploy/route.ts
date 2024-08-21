import { NextResponse } from "next/server";
import { withApiToken } from "@/app/middleware/withApiToken";
 import { isEmpty, isEqual, sortBy } from "lodash-es";
import { StatusCodes } from "http-status-codes";
import deployContract from "@/services/deployContract";
import { getContractsConstructor } from "@/contracts/interfaces";
import { smartContractModel } from "@/prisma/models";

async function postHandler(req: NextRequestWithAuth, { params: { contractName } }): Promise<NextResponse>  {
  const constructorArgs = getContractsConstructor(contractName);

  // TODO: query the contract class hash based on the contractName from the URL
  const classHash = `0x019994ff99f2a22bda55218dc609fe644d977a0581694d1d6a2bd05977376b52`;

  const body = await req.json();
  if (!isEqual(sortBy(constructorArgs), Object.keys(body)) && !isEmpty(body)) {
    return NextResponse.json(
      { error: `Invalid constructor arguments for contract ${contractName}. The proper arguments are: ${constructorArgs}` },
      { status: StatusCodes.BAD_REQUEST },
    );
  }

  const deployResponse = await deployContract({
    contractName,
    constructorArgs: body,
    classHash
  });

  const maxId = await smartContractModel.aggregate({
    where: { developerUserId: req.userId },
    _max: {
      userVersion: true,
    },
  });

  const nextId = (maxId._max.userVersion || 0) + 1;
  
  await smartContractModel.create({
    data: {
      address: deployResponse.contract_address,
      name: contractName,
      developerUserId: req.userId,
      userVersion: nextId,
    },
  });

  return NextResponse.json(
    { ...deployResponse },
    { status: StatusCodes.OK } ,
  );
}

export const POST = withApiToken(postHandler);
