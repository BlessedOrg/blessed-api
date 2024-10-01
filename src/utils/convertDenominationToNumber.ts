export function convertDenominationToNumber(input: string | number): number {
  if (typeof input === "number") {
    return input;
  }
  if (/^\d+(\.\d+)?$/.test(input)) {
    return parseFloat(input);
  }

  const match = input.match(/^(\d+(?:\.\d+)?)([uc])$/);

  if (!match) {
    throw new Error("Invalid input format. Expected format: 'number' or 'number[u|c]'");
  }

  const [, valueStr, nominal] = match;
  const value = parseFloat(valueStr);

  switch (nominal) {
    case "u":
      return value * Math.pow(10, 18);
    case "c":
      return value;
    default:
      throw new Error("Invalid nominal. Expected 'u', 'c'");
  }
}
