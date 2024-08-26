import { NextResponse } from "next/server";
import { withApiToken } from "@/app/middleware/withApiToken";
import { isEmpty, isEqual, sortBy } from "lodash-es";
import { StatusCodes } from "http-status-codes";
import deployContract from "@/services/deployContract";
import { getContractClassHash, getContractsConstructor } from "@/contracts/interfaces";
import { smartContractModel } from "@/prisma/models";

async function postHandler(req: NextRequestWithAuth, { params: { contractName } }): Promise<NextResponse> {
  try {
    const classHash = getContractClassHash(contractName);
    if (!classHash) {
      return NextResponse.json(
        { error: `Class hash for the contract ${contractName} not found! Are you sure you are passing correct contract's name? Check list of available contracts at /api/public/contracts` },
        { status: StatusCodes.BAD_REQUEST }
      );
    }
    const constructorArgs = getContractsConstructor(contractName);

    const body = await req.json();

    if (!isEqual(sortBy(constructorArgs), sortBy(Object.keys(body))) || isEmpty(body)) {
      return NextResponse.json(
        { error: `Invalid constructor arguments for contract ${contractName}. The proper arguments are: ${constructorArgs} (in this particular order)` },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const deployResponse = await deployContract({
      contractName,
      constructorArgs: body,
      classHash
    });

    const maxId = await smartContractModel.aggregate({
      where: {
        developerUserId: req.userId,
        name: contractName
      },
      _max: {
        userVersion: true
      }
    });

    const nextId = (maxId._max.userVersion || 0) + 1;

    const smartContractRecord = await smartContractModel.create({
      data: {
        address: deployResponse.contract_address,
        name: contractName,
        developerUserId: req.userId,
        userVersion: nextId
      }
    });

    return NextResponse.json(
      {
        ...deployResponse,
        databaseId: smartContractRecord?.id,
        userVersion: smartContractRecord?.userVersion,
        contractName: smartContractRecord?.name
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.log("🚨 Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
}

export const POST = withApiToken(postHandler);
