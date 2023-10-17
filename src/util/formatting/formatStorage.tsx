export function formatStorage(val: number) {
  const units = ["B", "kB", "MB", "GB", "TB", "PB"];
  const log1024 = 3.0102999566398119521373889472449;

  let i;
  if (val <= 1024.0) {
    i = 0;
  } else {
    i = Math.floor(Math.log10(val) / log1024); // log10(1000)
  }

  const p = Math.pow(1024.0, i);
  const s = (val / p).toFixed(2);

  return s + " " + units[i];
}
