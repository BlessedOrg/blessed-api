import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { withDevAuth } from "@/app/middleware/withDevAuth";
import { erc20TokenModel, smartContractModel } from "@/prisma/models";
import deployContract from "@/services/deployContract";
import { contractsNames } from "@/contracts/interfaces";

async function handler(req: NextRequestWithDevAuth) {
  const body = await req.json();
  const { name, symbol, supplyAmount } = body;

  if (!name || !symbol || !supplyAmount) {
    return NextResponse.json(
      { error: "Missing parameters" },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

  const contractClassHash =
    "0x05eecb88cfbe969745a1e1e886010bcd4177164e5e131f71b69176ca6960eda0";

  const supply = BigInt(supplyAmount) * BigInt(10 ** 18);

  const ownerAddress = req.developerWalletAddress;

  try {
    const deployResponse = await deployContract({
      classHash: contractClassHash,
      contractName: contractsNames().ERC20EventCurrency,
      constructorArgs: {
        owner: ownerAddress,
        name,
        symbol,
        supply
      }
    });
    const { status } = deployResponse;
    if (status === "success") {
      const maxId = await smartContractModel.aggregate({
        where: {
          developerId: req.developerId,
          name
        },
        _max: {
          version: true
        }
      });
      const nextId = (maxId._max.version || 0) + 1;
      const smartContractRecord = await smartContractModel.create({
        data: {
          name,
          address: deployResponse.contract_address,
          version: nextId
        }
      })

      const createdErc20Record = await erc20TokenModel.create({
        data: {
          developerId: req.developerId,
          smartContractId: smartContractRecord.address,
          contractAddress: deployResponse.contract_address,
          name,
          symbol,
          supply: Number(supplyAmount),
          decimals: 18
        }
      });

      return NextResponse.json(
        {
          contractAddress: deployResponse.contract_address,
          status,
          createdErc20Record
        },
        {
          status: StatusCodes.OK
        }
      );
    }
  } catch (e) {
    const error = e.message as any;
    return NextResponse.json(
      { error },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

export const POST = withDevAuth(handler);
