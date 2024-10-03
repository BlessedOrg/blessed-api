import { PrivyClient } from "@privy-io/server-auth";

const privyAppSecret = process.env.PRIVY_APP_SECRET as string;
const privyAppId = process.env.PRIVY_APP_ID as string;

export const privy = new PrivyClient(privyAppId, privyAppSecret);