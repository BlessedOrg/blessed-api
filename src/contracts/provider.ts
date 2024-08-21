import {constants, Provider} from "starknet";

const provider = new Provider({
    nodeUrl: constants.NetworkName.SN_SEPOLIA,
});

export default provider;
