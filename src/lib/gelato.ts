import { CallWithERC2771Request, ERC2771Type, GelatoRelay } from "@gelatonetwork/relay-sdk-viem";
import { getCapsuleSigner } from "@/lib/capsule";
import { StatusCodes } from "http-status-codes";

export const gaslessTransaction = async (request: CallWithERC2771Request, capsuleTokenVaultKey: string) => {
  try {
    const relay = new GelatoRelay();
    const capsuleSigner = await getCapsuleSigner(capsuleTokenVaultKey);
    const { struct, signature } = await relay.getSignatureDataERC2771(
      request,
      capsuleSigner as any,
      ERC2771Type.SponsoredCall
    );

    const relayResponse = await relay.sponsoredCallERC2771WithSignature(
      struct,
      signature,
      process.env.GELATO_RELAY_API_KEY
    );

    return { data: relayResponse };
  } catch (e) {
    return { error: e, status: StatusCodes.INTERNAL_SERVER_ERROR };
  }
};