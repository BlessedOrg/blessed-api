import { NextResponse } from "next/server";
import { isEmpty, isEqual, sortBy } from "lodash-es";
import { StatusCodes } from "http-status-codes";
import deployContract from "@/server/services/deployContract";
import { getContractClassHash, getContractsConstructorsNames } from "@/contracts/interfaces";
import { smartContractModel } from "@/prisma/models";
import { withDeveloperAccessToken } from "@/app/middleware/withDeveloperAccessToken";
import { withDeveloperApiToken } from "@/app/middleware/withDeveloperApiToken";
import { uploadMetadata } from "@/server/services/irys";

export const maxDuration = 300;

async function postHandler(req: NextRequestWithAuth, { params: { contractName } }): Promise<NextResponse> {
  try {
    const classHash = getContractClassHash(contractName);
    if (!classHash) {
      return NextResponse.json(
        { error: `Class hash for the contract ${contractName} not found! Are you sure you are passing correct contract's name? Check list of available contracts at /api/public/contracts` },
        { status: StatusCodes.BAD_REQUEST }
      );
    }
    const constructorArgs = getContractsConstructorsNames(contractName);

    const body = await req.json();

    if (!isEqual(sortBy(constructorArgs), sortBy(Object.keys(body.constructor))) || isEmpty(body)) {
      return NextResponse.json(
        { error: `Invalid constructor arguments for contract ${contractName}. The proper arguments are: ${constructorArgs} (in this particular order)` },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const { metadata: { name, description, image, symbol } } = body;

    if (!name || !description || !image || !symbol) {
      return NextResponse.json(
        { error: `Invalid metadata fields. The proper fields are: name (string), description (string), image (base64 string)` },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const metadataUrl = await uploadMetadata({ name, description, symbol, image });

    const deployResponse = await deployContract({
      contractName,
      constructorArgs: body.constructor,
      classHash
    });

    const maxId = await smartContractModel.aggregate({
      where: {
        developerId: req.developerId,
        name: contractName
      },
      _max: {
        version: true
      }
    });

    const nextId = (maxId._max.version || 0) + 1;

    const smartContractRecord = await smartContractModel.create({
      data: {
        address: deployResponse.contract_address,
        name: contractName,
        developerId: req.developerId,
        version: nextId,
        metadataUrl,
        metadataPayload: body.metadata
      }
    });

    return NextResponse.json(
      {
        contractName: smartContractRecord?.name,
        version: smartContractRecord?.version,
        databaseId: smartContractRecord?.id,
        metadataUrl,
        ...deployResponse
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.log("🚨 Deploy error:", error.message);
    return NextResponse.json(
      { error: error.message },
      { status: StatusCodes.BAD_REQUEST }
    );
  }
}

export const POST = withDeveloperApiToken(withDeveloperAccessToken(postHandler));
