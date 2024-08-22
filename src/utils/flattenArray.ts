export const flattenArray = (arr) => {
    return arr.reduce(
        (acc, val) =>
            Array.isArray(val) ? acc.concat(flattenArray(val)) : acc.concat(val),
        [],
    );
};