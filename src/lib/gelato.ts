"use server";
import { CallWithERC2771Request, ERC2771Type, GelatoRelay } from "@gelatonetwork/relay-sdk-viem";
import { getCapsuleSigner } from "@/lib/capsule";
import { StatusCodes } from "http-status-codes";

export const gaslessTransaction = async (request: CallWithERC2771Request, capsuleTokenVaultKey: string): Promise<{ data?: { taskId?: string }, error?: any, status?: number }> => {
  try {
    const relay = new GelatoRelay();
    console.log(1);
    const capsuleSigner = await getCapsuleSigner(capsuleTokenVaultKey);
    console.log(2);
    const { struct, signature } = await relay.getSignatureDataERC2771(
      request,
      capsuleSigner as any,
      ERC2771Type.SponsoredCall
    );

    console.log(3);
    const relayResponse = await relay.sponsoredCallERC2771WithSignature(
      struct,
      signature,
      process.env.GELATO_RELAY_API_KEY
    );

    return { data: relayResponse };
  } catch (e) {
    console.log(e);
    return { error: JSON.stringify(e), status: StatusCodes.INTERNAL_SERVER_ERROR };
  }
};