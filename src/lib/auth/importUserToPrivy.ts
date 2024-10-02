"use server";

import { privy } from "@/lib/privy";

export const importUserToPrivy = async(email: string)=> {
  try {
    return privy.importUser({
      linkedAccounts: [
        {
          type: 'email',
          address: email,
        },
      ],
      createEthereumWallet: true,
    })
  } catch(e){
    console.log("Error occured while importing user to privy:", e)
  }
}