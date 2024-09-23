import { NextResponse } from "next/server";
import { isEmpty, isEqual, sortBy } from "lodash-es";
import { StatusCodes } from "http-status-codes";
import deployContract from "@/server/services/deployContract";
import { getContractClassHash, getContractsConstructorsNames, getContractsFunctions } from "@/contracts/interfaces";
import { smartContractModel } from "@/prisma/models";
import { withDeveloperApiToken } from "@/app/middleware/withDeveloperApiToken";
import { uploadMetadata } from "@/server/services/irys";
import z from "zod";
import provider from "@/contracts/provider";
import { getAccountInstance } from "@/server/api/accounts/getAccountInstance";
import connectToContract from "@/server/services/connectToContract";
import { gaslessTransactionWithFallback } from "@/server/gaslessTransactionWithFallback";

export const maxDuration = 300;

async function postHandler(req: NextRequestWithApiTokenAuth, { params: { contractName } }): Promise<NextResponse> {
  try {
    const classHash = getContractClassHash(contractName);
    if (!classHash) {
      return NextResponse.json(
        { error: `Class hash for the contract ${contractName} not found! Are you sure you are passing correct contract's name? Check list of available contracts at /api/public/contracts` },
        { status: StatusCodes.BAD_REQUEST }
      );
    }
    const body = await req.json();
    const { metadata, ...constructor } = body;

    const constructorArgs = getContractsConstructorsNames(contractName);

    let finalConstructor = constructor;

    if (!isEqual(sortBy(constructorArgs), sortBy(Object.keys(finalConstructor))) || isEmpty(body)) {
      return NextResponse.json(
        { error: `Invalid constructor arguments for contract ${contractName}. The proper arguments are: ${constructorArgs} (in this particular order)` },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const MetadataSchema = z.object({
      metadata: z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        image: z.string().min(1),
        symbol: z.string().min(1)
      }).required()
    });

    const parsedBody = MetadataSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: `Invalid request body. The proper fields are: metadata { name (string), description (string), image (base64 string), symbol (string) }` },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const {
      metadata: { name, description, image, symbol }
    } = parsedBody.data;

    if (!name || !description || !image || !symbol) {
      return NextResponse.json(
        { error: `Invalid metadata fields. The proper fields are: name (string), description (string), image (base64 string)` },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const metadataUrl = await uploadMetadata({ name, description, symbol, image });

    finalConstructor = {
      ...finalConstructor,
      base_uri: metadataUrl
    }

    // 🏗️. TODO: create a filter function called overwrites() for following cases
    if (contractName === "ticket") {
      if (constructor.ticket_type === "free") {
        finalConstructor = {
          ...finalConstructor,
          // 🏗️ TODO: replace it with 0 address if possible?
          erc20_address: "0x3e5654865fc27ead8ea32557b30717e241314f7f6b74e328b83b89ea927c33c"
        }
      }
    }

    const deployResponse = await deployContract({
      contractName,
      constructorArgs: finalConstructor,
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
        metadataPayload: body.metadata,
        appId: req.appId
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
    return NextResponse.json({ error: error.message }, { status: StatusCodes.BAD_REQUEST });
  }
}

export const POST = withDeveloperApiToken(postHandler);
