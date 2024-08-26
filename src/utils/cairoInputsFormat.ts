export const cairoInputsFormat = (inputs: any[]) => {
  return inputs.map((i) => {
    if (i.type.includes("integer")) {
      return {
        name: i.name,
        type: "number"
      };
    }
    return {
      name: i.name,
      type: "string"
    };
  });
};