export function formatSU(val: number) {
  const units = ["SU", "kSU", "MSU", "GSU", "TSU", "PSU"];

  let i;
  if (val <= 1000.0) {
    i = 0;
  } else {
    i = Math.floor(Math.log10(val) / 3); // log10(1000)
  }

  const p = Math.pow(1000.0, i);
  const s = (val / p).toFixed(2);

  return s + " " + units[i];
}
