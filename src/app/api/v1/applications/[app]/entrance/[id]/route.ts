import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { withApiKeyAndUserAccessToken } from "@/app/middleware/withApiKeyAndUserAccessToken";
import z from "zod";
import { smartContractModel } from "@/models";
import { activeChain, contractArtifacts, readContract } from "@/lib/viem";
import { encodeFunctionData } from "viem";
import { CallWithERC2771Request } from "@gelatonetwork/relay-sdk-viem";
import { gaslessTransaction } from "@/lib/gelato";

const EntrySchema = z.object({
  ticketId: z.number().int().positive("Ticket id must be a positive integer")
});
async function postRequest(req: NextRequestWithApiKeyAndUserAccessToken, { params: { id } }) {
  const validBody = EntrySchema.safeParse(await req.json());
  if (!validBody.success) {
    return NextResponse.json(
      { error: `Validation failed: ${validBody.error}` },
      { status: StatusCodes.NOT_FOUND }
    );
  }
  try {
    const entranceRecord = await smartContractModel.findUnique({ where: { id } });
    if (!entranceRecord.address) {
      return NextResponse.json(
        { error: `Wrong parameters. Smart contract entrance from app ${req.appSlug} not found.` },
        { status: StatusCodes.BAD_REQUEST }
      );
    }
    const entranceContract = entranceRecord.address as `0x${string}`;
    const isAlreadyEntered = await readContract(entranceContract, contractArtifacts["entrance"].abi, "hasEntry", [req.walletAddress]);
    if (!isAlreadyEntered) {
      const data = encodeFunctionData({
        abi: contractArtifacts["entrance"].abi,
        functionName: "entry",
        args: [validBody.data.ticketId]
      }) as `0x${string}`;
      const request: CallWithERC2771Request = {
        chainId: BigInt(activeChain.id),
        target: entranceContract,
        data: data,
        user: req.walletAddress
      };
      const { data: gaslessTxData, error, status } = await gaslessTransaction(request, req.capsuleTokenVaultKey);
      if (gaslessTxData?.taskId) {
        await new Promise((resolve) => setTimeout(resolve, 4000));
        const url = `https://relay.gelato.digital/tasks/status/${gaslessTxData?.taskId}`;
        const response = await fetch(url);
        const responseJson = await response.json();
        return NextResponse.json({ message: "Success", taskId: gaslessTxData?.taskId, taskStatus: responseJson }, { status });
      }
      return NextResponse.json({ error }, { status });
    } else {
      return NextResponse.json({ message: "Already entered" }, {
        status: StatusCodes.OK
      });
    }
  } catch (e) {
    console.error("Error keys:", Object.keys(e));
    console.log("Cause keys:", Object.keys(e?.cause));
    return NextResponse.json({ error: e?.cause?.reason || e?.shortMessage || e?.message || e }, { status: StatusCodes.BAD_REQUEST });
  }
}

export const POST = withApiKeyAndUserAccessToken(postRequest);

