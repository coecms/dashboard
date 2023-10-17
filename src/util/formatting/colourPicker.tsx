const colours = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7f00",
  "#0088fe",
  "#00c49f",
  "#ff5733",
  "#ffcc29",
  "#ff6b81",
  "#a05195",
  "#ff8c52",
  "#a3de83",
];

export function colourPicker(index) {
  return colours[index % colours.length];
}
