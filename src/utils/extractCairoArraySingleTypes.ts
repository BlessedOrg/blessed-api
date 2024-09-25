import { ciaroTypeFormat } from "@/utils/cairoInputsFormat";

function mapTypeName(name: string): string {
  switch (name) {
    case "ContractAddress":
      return "contract_address";
    case "u8":
    case "u16":
    case "u32":
    case "u64":
    case "u128":
    case "usize":
    case "i8":
    case "i16":
    case "i32":
    case "i64":
    case "i128":
    case "isize":
      return "integer";
    default:
      return name.toLowerCase();
  }
}
export function extractCairoArraySingleTypes(input: string, withTsTypes = false) {
  const types = [];
  const match = input.match(/<(.+)>/);
  if (match) {
    const content = match[1];
    const elements = content.split(",");

    for (let element of elements) {
      const typeParts = element.split("::");
      let typeName = typeParts[typeParts.length - 1];

      typeName = typeName.trim().replace(/[()]/g, "");
      types.push(mapTypeName(typeName));
    }
  }
  if (withTsTypes) {
    return types.map((i) => ciaroTypeFormat(input));
  }

  return types;
}
