import z from "zod";

export function generateSchemaForContractBody(functionObject: any) {
  const inputSchema: Record<string, z.ZodTypeAny> = {};

  functionObject.inputs.forEach((input: any) => {
    const { name, type } = input;
    if (type === "core::array::Array::<(core::starknet::contract_address::ContractAddress, core::integer::u8)>") {
      inputSchema[name] = z.array(
        z.array(
          z.union([
            z.string().regex(/^0x[a-fA-F0-9]{60,65}$/, 'Invalid Starknet address'),
            z.number().int().min(0).max(99)
          ])
        ).length(2)
      ).min(1);
    } else if (type.includes("integer")) {
      inputSchema[name] = z.number();
    } else {
      inputSchema[name] = z.any();
    }
  });

  return z.object(inputSchema);
}