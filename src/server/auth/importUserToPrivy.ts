"use server";

import { privy } from "@/privy/privyClient";

export const importUserToPrivy = async(email: string)=> {
  try {
    const privyUser = await privy.importUser({
      linkedAccounts: [
        {
          type: 'email',
          address: email,
        },
      ],
      createEthereumWallet: true,
    })
    return privyUser
  } catch(e){
    console.log("Error occured while importing user to privy:", e)
  }
}