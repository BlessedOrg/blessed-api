export const retrieveWalletCredentials = (keys) => {
    const walletAddress = keys.fields.find(
        (field) => field.id === "walletAddress",
    )?.value;
    const privateKey = keys.fields.find(
        (field) => field.id === "privateKey",
    )?.value;

    return { walletAddress, privateKey };
}