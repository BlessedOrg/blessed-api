import {developerAccountModel} from "@/prisma/models";
import {getVaultItem} from "@/server/vaultApi";
import {retrieveWalletCredentials} from "@/utils/retrieveWalletCredentials";
import {Account} from "starknet";
import provider from "@/contracts/provider";

export const getDeveloperData = async(req: NextRequestWithDevAuth) => {
    const developerId = req.developerId;
    const accountData = await developerAccountModel.findUnique({ where: { id: developerId } });
    const keys = await getVaultItem(accountData.vaultKey, "privateKey");
    const { walletAddress, privateKey } = retrieveWalletCredentials(keys);
    const account = new Account(provider, walletAddress, privateKey);

    return {
        account,
        accountData
    }
}