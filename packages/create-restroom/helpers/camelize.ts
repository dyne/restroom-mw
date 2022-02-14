export const camelize = (input: string): string => {
  return input.toLowerCase().replace(/-(.)/g, function (match, group1) {
    return group1.toUpperCase();
  });
}
