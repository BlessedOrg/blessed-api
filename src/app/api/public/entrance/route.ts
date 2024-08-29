import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { generateQrCode } from "@/services/generateQrCode";
import { getDeveloperData } from "@/server/getDeveloperData";
import deployContract from "@/services/deployContract";
import { getContractClassHash } from "@/contracts/interfaces";
import { withDevAuth } from "@/app/middleware/withDevAuth";
import { smartContractModel } from "@/prisma/models";

async function handler(req: NextRequestWithDevAuth) {
  const { accountData, account } = await getDeveloperData(req);

  try {
    const deployedEntranceContract = await deployContract({
      contractName: "EntranceContract",
      constructorArgs: { owner: account.address },
      classHash: getContractClassHash("EntranceContract"),
    });

    const maxId = await smartContractModel.aggregate({
      where: {
        developerId: req.developerId,
        name: "EntranceContract",
      },
      _max: {
        version: true,
      },
    });

    const nextId = (maxId._max.version || 0) + 1;
    await smartContractModel.create({
      data: {
        address: deployedEntranceContract.contract_address,
        name: "EntranceContract",
        developerId: accountData.id,
        version: nextId,
      },
    });
    const qr = await generateQrCode(
      `http://${process.env.MOBILE_BASE_URL}/entrance?contractAddress=${deployedEntranceContract.address}`,
    );

    return NextResponse.json(
      { qr, deployedEntranceContract },
      {
        status: StatusCodes.OK,
      },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e.message },
      { status: StatusCodes.BAD_REQUEST },
    );
  }
}

export const POST = withDevAuth(handler);
