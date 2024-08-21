import { withAuth } from "@/app/middleware/withAuth";
import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import {developerAccountModel, erc20TokenModel} from "@/prisma/models";
import {getVaultPrivateKeyItem} from "@/server/vaultApi";

const allowedErc20Methods = [
  {
    name: "transfer",
    inputs: [
      {
        name: "recipient",
        type: "address",
      },
      {
        name: "amount",
        type: "uint256",
      },
    ],
  },
  {
    name: "burn",
    inputs: [
      {
        name: "amount",
        type: "uint256",
      },
    ],
  },
];

async function handler(
  req: NextRequestWithAuth,
  { params: { contractAddress, method } },
) {

  const { userId, developerId } = req;

  console.log(method, contractAddress)
  if (!allowedErc20Methods.some((m) => m.name === method)) {
    return NextResponse.json(
        { error: "Method not allowed" },
        { status: StatusCodes.BAD_REQUEST },
    );
  }

  const contract = await erc20TokenModel.findFirst({
    where: { contractAddress },
  });

  if (!contract) {
    return NextResponse.json(
        { error: "Contract not found" },
        { status: StatusCodes.NOT_FOUND },
    );
  }

  if(!!developerId){
    const devData = await developerAccountModel.findUnique({where: {id: developerId}})

    const keys = await getVaultPrivateKeyItem(devData.vaultKey);

    return NextResponse.json(
        { keys, method },
        { status: StatusCodes.OK },
    );
  }

  if(!!userId){

  }

  return NextResponse.json(
    { contract, method },
    { status: StatusCodes.OK },
  );
}

export const POST = withAuth(handler);
