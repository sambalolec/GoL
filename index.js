const zeilen = 50;
const spalten = 50;
const matrix = Array(zeilen)
  .fill(0)
  .map(() => Array(spalten).fill(0));

/*
const matrix = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 0, 5, 10, 15],
];
*/

// ANSI-Farbpalette (0–15)
const ansiColors = [
  "#000000",
  "#800000",
  "#008000",
  "#808000",
  "#000080",
  "#800080",
  "#008080",
  "#c0c0c0",
  "#808080",
  "#ff0000",
  "#00ff00",
  "#ffff00",
  "#0000ff",
  "#ff00ff",
  "#00ffff",
  "#ffffff",
];

const container = document.getElementById("table-container");
const table = document.createElement("table");

matrix.forEach((rowData) => {
  const row = document.createElement("tr");
  rowData.forEach((value) => {
    const cell = document.createElement("td");
    cell.style.backgroundColor = ansiColors[value];
    row.appendChild(cell);
  });
  table.appendChild(row);
});

container.appendChild(table);
