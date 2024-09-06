import { Abi } from "starknet";
import { ciaroTypeFormat } from "@/utils/cairoInputsFormat";

export function getContractEventInterface(eventName: string, abi: any[] | Abi) {
  const events = abi.filter((item) => item.type === "event");
  const event = events.find((e) => e.name.includes(eventName));

  if (!event) {
    return null;
  }

  const fields = event.members.map((member) => ({
    name: member.name,
    type: ciaroTypeFormat(member.type),
    kind: member.kind,
  }));

  return {
    name: eventName,
    fields,
  };
}
