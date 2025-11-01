/************************************************** User defined Vars *******************************************/
// Farben
const palette = [
  "#000000", //Grundfarbe! Nicht ändern.
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

// Tabellenformat
const zeilen = 45;
const spalten = 110;
const width = "12px";
const height = width;

// Farben
const color = 11; // Defaultfarbe für Zellen
const colorCycling = true;

// Speed
const intervall = 50;

// Matrix mit 0 initialisieren
let matrix = Array.from({ length: zeilen }, () => Array(spalten).fill(0));

/************************************************* Gol-Functions ******************************** */
// R-pentomino bauen, für Testing
function r_Pentomino() {
  const x0 = spalten >>> 1;
  const y0 = zeilen >>> 1;
  matrix[y0 - 1][x0 + 1] = color;
  matrix[y0 - 2][x0 + 1] = color;
  matrix[y0 - 2][x0 + 0] = color;
  matrix[y0 - 3][x0 + 1] = color;
  matrix[y0 - 3][x0 + 2] = color;
}
r_Pentomino();

let rounds = 0;
function transformMatrix() {
  // Wrapper horizontal
  const x_ = (val) => {
    let out = val;
    if (val >= spalten) out = 0;
    if (val < 0) out = spalten - 1;
    return out;
  };
  // Wrapper vertikal
  const y_ = (val) => {
    let out = val;
    if (val >= zeilen) out = 0;
    if (val < 0) out = zeilen - 1;
    return out;
  };
  // Farbpalette durchgehen
  const cycleCol = (col) => {
    if (col < palette.length - 1) return col + 1;
    else return 1;
  };

  let m = Array(zeilen)
    .fill(0)
    .map(() => Array(spalten).fill(0));

  for (let y = 0; y < zeilen; y++) {
    for (let x = 0; x < spalten; x++) {
      let neighbours = 0;

      // Nachbarn an den Flächen zählen
      if (matrix[y_(y + 1)][x_(x)] !== 0) neighbours += 1; //Oben
      if (matrix[y_(y - 1)][x_(x)] !== 0) neighbours += 1; //Unten
      if (matrix[y_(y)][x_(x + 1)] !== 0) neighbours += 1; //Rechts
      if (matrix[y_(y)][x_(x - 1)] !== 0) neighbours += 1; //Links

      // Nachbarn an den Ecken zählen
      if (matrix[y_(y + 1)][x_(x + 1)] !== 0) neighbours += 1; //Oben Rechts
      if (matrix[y_(y + 1)][x_(x - 1)] !== 0) neighbours += 1; //Oben Links
      if (matrix[y_(y - 1)][x_(x + 1)] !== 0) neighbours += 1; //Unten Rechts
      if (matrix[y_(y - 1)][x_(x - 1)] !== 0) neighbours += 1; //Unten Links

      // Standardregeln anwenden
      if (matrix[y][x] === 0) {
        //Zelle tot
        if (neighbours === 3) m[y][x] = 10;
      } else {
        // Zelle lebt
        if (neighbours === 2 || neighbours === 3)
          if (colorCycling === true) m[y][x] = cycleCol(matrix[y][x]);
          else m[y][x] = 10;
      }
    }
  }
  rounds += 1;
  return m;
}

/********************************************************* Output *********************************************/

function start() {
  matrix = transformMatrix();
  viewport_container(matrix);
  const counter = document.getElementById("counter");
  counter.textContent = "Runden: " + rounds;
}

// Viewport für die Seite bauen
function viewport_container(matrix) {
  const container = document.getElementById("viewbox-container");

  container.innerHTML = ""; // Container leeren
  const table = document.createElement("table");

  // Tabelle bauen
  matrix.forEach((rowData, y) => {
    const row = document.createElement("tr");
    rowData.forEach((value, x) => {
      const cell = document.createElement("td");
      cell.style.backgroundColor = palette[value];
      cell.style.width = width;
      cell.style.height = height;
      // Zellen einfügen
      row.appendChild(cell);
    });
    // Zeilen einfügen
    table.appendChild(row);
    // table.style.borderCollapse = "collapse";
    table.style.borderStyle = "dashed";
    table.style.borderWidth = "1px";
    table.style.margin = "1.5rem auto";
  });
  // Tabelle einfügen
  container.appendChild(table);
}

// Starten und Stoppen
let loop = null;
let started = false;
viewport_container(matrix); // Erstes Bild

// Controlbutton
document.getElementById("control").addEventListener("click", () => {
  const butt = document.getElementById("control");
  if (!started) {
    loop = setInterval(start, intervall);
    started = true;

    butt.textContent = "Stop";
  } else {
    clearInterval(loop);
    started = false;
    butt.textContent = "Start";
  }
});

// Button zum Resetten
document.getElementById("Reset").addEventListener("click", () => {
  // Dummy
});

/*******************************************************************************

Spiel läuft soweit, scheinbar fehlerfrei.
Rundenzähler ist drin.

Fehlt noch:
- Editor
- Rulemanagement
- Was wo man draufklickt und dann was zu lesen kriegt
- Makeup

********************************************************************************/
