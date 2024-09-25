import z from "zod";
import { convertDenominationToNumber } from "@/utils/convertDenominationToNumber";
import { extractCairoArraySingleTypes } from "@/utils/extractCairoArraySingleTypes";

export function generateSchemaForContractBody(functionObject: any) {
  const inputSchema: Record<string, z.ZodTypeAny> = {};

  functionObject.inputs.forEach((input: any) => {
    const { name, type } = input;
    if (type.includes("core::array")) {
      const [expectedType] = extractCairoArraySingleTypes(type, true) as ["string" | "number" | "boolean"];
      let elementSchema: z.ZodTypeAny;

      switch (expectedType) {
        case "number":
          elementSchema = z
            .union([
              z.number(),
              z.string().refine(
                (val) => {
                  try {
                    Number(val);
                    return true;
                  } catch {
                    return false;
                  }
                },
                {
                  message: "Invalid number format. Expected a number or 'number[u|c]'"
                }
              )
            ])
            .transform((val) => {
              if (typeof val === "number") return val;
              return Number(val);
            });
          break;
        case "string":
          elementSchema = z.string();
          break;
        case "boolean":
          elementSchema = z.boolean();
          break;
        default:
          elementSchema = z.any();
      }

      inputSchema[name] = z.union([elementSchema, z.array(elementSchema)]).transform((value) => (Array.isArray(value) ? value : [value]));
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
