export type SelectOptionsType = {
  value: string | number;
  label: string;
};

export default function getFormattedOptionsForSelect(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jsonObject: any
): SelectOptionsType[] {
  const formattedJSONObject = Object.entries(jsonObject).map((entry) => ({
    value: entry[0],
    label: entry[1] as string,
  }));
  return formattedJSONObject;
}
