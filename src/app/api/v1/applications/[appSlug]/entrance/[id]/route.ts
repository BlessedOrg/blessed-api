import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import { withApiKeyAndUserAccessToken } from "@/app/middleware/withApiKeyAndUserAccessToken";
import z from "zod";
import { smartContractModel } from "@/models";
import { getCapsuleSigner } from "@/lib/capsule";
import { account, activeChain, contractArtifacts, readContract } from "@/lib/viem";

const EntrySchema = z.object({
  ticketId: z.number().int().positive("Ticket id must be a positive integer")
});
export async function postRequest(req: NextRequestWithApiKeyAndUserAccessToken, { params: { id } }) {
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
    const userAccount = await getCapsuleSigner(req.capsuleTokenVaultKey);
    const entranceContract = entranceRecord.address as `0x${string}`;
    const isAlreadyEntered = await readContract(entranceContract, contractArtifacts["entrance"].abi, "hasEntry", [userAccount.account.address]);
    if (!isAlreadyEntered) {
      const entryTxHash = await userAccount.writeContract({
        address: entranceContract,
        abi: contractArtifacts["entrance"].abi,
        functionName: "entry",
        args: [validBody.data.ticketId],
        account: account,
        chain: activeChain
      });
      if (typeof entryTxHash === "string" && entryTxHash.startsWith("0x")) {
        return NextResponse.json({ message: "Success", entryTxHash }, {
          status: StatusCodes.OK
        });
      }
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

