import z from "zod";

export function generateSchemaForContractBody(functionObject: any) {
  const inputSchema: Record<string, z.ZodTypeAny> = {};

  functionObject.inputs.forEach((input: any) => {
    const { name, type } = input;

    if (type.includes("integer")) {
      inputSchema[name] = z.number();
    } else {
      inputSchema[name] = z.string();
    }
  });

  return z.object(inputSchema);
}