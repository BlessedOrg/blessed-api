'use server'

import {Account, Calldata, CallData, constants, Contract, ec, hash, num, RpcProvider, stark} from "starknet";
import ethAbi from "@/contracts/abis/ethAbi.json";
import {createVaultPrivateKeyItem} from "@/app/server/vaultApi";

export async function createAndDeployAccount(email: string){
    const provider = new RpcProvider({
        nodeUrl: constants.NetworkName.SN_SEPOLIA,
    });

    // Argent
    const argentXaccountClassHash = process.env.NEXT_PUBLIC_ARGENT_ACCOUNT_CLASS_HASH!;

    //Operator account
    const operatorPrivateKey = process.env.OPERATOR_PRIVATE_KEY!;
    const operatorPublicKey = process.env.OPERATOR_PUBLIC_KEY!;
    if(!operatorPrivateKey || !operatorPublicKey || !argentXaccountClassHash) {
        throw new Error("Missing operator/argent environment variables");
    }
    const operatorAccount = new Account(
        provider,
        operatorPublicKey,
        operatorPrivateKey,
    );

    //ETH contract
    const ethContractAddress = process.env.NEXT_PUBLIC_ETH_CONTRACT_ADDRESS!;
    if(!ethContractAddress) {
        throw new Error("Missing ETH environment variables");
    }
    const ethContract = new Contract(ethAbi, ethContractAddress, operatorAccount);

    // Generate public and private key pair.
    const privateKeyAX = stark.randomAddress();
    const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);
    // Calculate future address of the ArgentX account
    const AXConstructorCallData = CallData.compile({
        owner: starkKeyPubAX,
        guardian: "0",
    });
    const AXcontractAddress = hash.calculateContractAddressFromHash(
        starkKeyPubAX,
        argentXaccountClassHash,
        AXConstructorCallData,
        0,
    );
    if (!!AXcontractAddress) {
        console.log(
            `📝 Successfully created account with credentials: \n  - private key : ${privateKeyAX}  \n  - public key: ${starkKeyPubAX} \n  - precalculated address: ${AXcontractAddress}`,
        );
    }

    console.log("💎 Sending initial funds to the ArgentX account...");
    ethContract.connect(operatorAccount);
    const amountToSend = num.toBigInt(0.0007 * 10 ** 18);
    const transferTx: any = await ethContract.transfer(
        AXcontractAddress,
        amountToSend,
    );

    console.log("🔄 Waiting for transaction confirmation...")
    const confirmation = await provider.waitForTransaction(
        transferTx.transaction_hash,
    );

    if (confirmation.statusReceipt === "success") {
        console.log(
            "🚀 Successfully transfer initial funds to the ArgentX account",
        );
    }

    console.log("🔄 Deploying ArgentX account...");
    const deployStatus = await deploy(
        provider,
        argentXaccountClassHash,
        AXcontractAddress,
        privateKeyAX,
        AXConstructorCallData,
        starkKeyPubAX,
        email
    );
    return deployStatus
}

const deploy = async (
    provider: RpcProvider,
    argentXaccountClassHash: string,
    AXcontractAddress: string,
    privateKeyAX: string,
    AXConstructorCallData: Calldata,
    starkKeyPubAX: string,
    email: string,
) => {
    const accountAX = new Account(provider, AXcontractAddress, privateKeyAX);

    const deployAccountPayload = {
        classHash: argentXaccountClassHash,
        constructorCalldata: AXConstructorCallData,
        contractAddress: AXcontractAddress,
        addressSalt: starkKeyPubAX,
    };

    try {
        const {
            transaction_hash: AXdAth,
            contract_address: AXcontractFinalAddress,
        } = await accountAX.deployAccount(deployAccountPayload);

        if (AXcontractFinalAddress) {
            console.log(`✅ ArgentX wallet created & deployed: \n  - Final contract address: ${AXcontractFinalAddress}`,);
        }
        const vaultData = await createVaultPrivateKeyItem(privateKeyAX, starkKeyPubAX, email,true)
        return {
            message: "✅ ArgentX wallet created & deployed",
            contractAddress: AXcontractFinalAddress,
            privateKey: privateKeyAX,
            publicKey: starkKeyPubAX,
            vaultKey: vaultData.id
        };
    } catch (e) {
        const error = e as any;
        console.log(error);
        const vaultData = await createVaultPrivateKeyItem(privateKeyAX, starkKeyPubAX, email, false)
        return {
            message: "❌ ArgentX wallet deployment failed",
            error: error?.message,
            vaultKey: vaultData.id
        };
    }
}