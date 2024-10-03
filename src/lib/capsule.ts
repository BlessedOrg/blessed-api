import { Environment } from "@usecapsule/core-sdk";
import { Capsule } from "@usecapsule/server-sdk";

const capsule = new Capsule(Environment.BETA, process.env.CAPSULE_API_KEY!);

export { capsule };