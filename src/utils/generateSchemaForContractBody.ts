import z from "zod";
import { convertDenominationToNumber } from "@/utils/convertDenominationToNumber";

export function generateSchemaForContractBody(functionObject: any) {
  const inputSchema: Record<string, z.ZodTypeAny> = {};

  functionObject.inputs.forEach((input: any) => {
    const { name, type } = input;
    if (type === "core::array::Array::<(core::starknet::contract_address::ContractAddress, core::integer::u8)>") {
      inputSchema[name] = z
        .array(
          z
            .array(
              z.union([
                z.string().regex(/^0x[a-fA-F0-9]{60,65}$/, "Invalid Starknet address"),
                z.number().int().min(0).max(99)
              ])
            )
            .length(2)
        )
        .min(1);
    } else if (type.includes("integer")) {
      inputSchema[name] = z
        .union([
          z.number(),
          z.string().refine(
            (val) => {
              try {
                convertDenominationToNumber(val);
                return true;
              } catch {
                return false;
              }
            },
            {
              message: "Invalid number format. Expected a number or a string with 's', 'd', or 'a' suffix."
            }
          )
        ])
        .transform((val) => {
          if (typeof val === "number") return val;
          return convertDenominationToNumber(val);
        });
    } else {
      inputSchema[name] = z.any();
    }
  });

  return z.object(inputSchema);
}
