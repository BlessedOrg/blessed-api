import { privyAppId, privyAppSecret } from "./constans";
import { PrivyClient } from "@privy-io/server-auth";

export const privy = new PrivyClient(privyAppId, privyAppSecret);