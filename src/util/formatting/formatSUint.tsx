export function formatSUint(val: number) {
  const units = ["SU", "kSU", "MSU", "GSU", "TSU", "PSU"];

  let i;
  if (val <= 1000.0) {
    i = 0;
  } else {
    i = Math.floor(Math.log10(val) / 3); // log10(1000)
  }

  const p = Math.pow(1000.0, i);
  let s = val / p;
  let out = "";

  if (s < 10) {
    out = s.toFixed(1);
  } else {
    out = s.toFixed(0);
  }

  return out + " " + units[i];
}
