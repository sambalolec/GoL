/* ############################################## Globals ######################################### */
// Farben
const PALETTE = [
  "#000000", // Index === 0 <=> tote Zelle; Möglichst nicht ändern.
  "#ff0000",
  "#00ff00",
  "#ffff00",
  "#0000ff",
  "#ff00ff",
  "#ffffff",
  "#00ffff",
  "#800000",
  "#008000",
  "#808000",
  "#000080",
  "#800080",
  "#008080",
  "#c0c0c0",
  "#808080",
];

// Spielfeldgröße
const ZEILEN = 173;
const SPALTEN = 409;
// const CELL_WIDTH = "3px";
// const CELL_HEIGHT = CELL_WIDTH;

const CELL_SIZE = 3;
const BREITE = (CELL_SIZE + 1) * SPALTEN;
const HOEHE = (CELL_SIZE + 1) * ZEILEN;

/* ############################################## Main ######################################### */

function randomArray() {
  const m = Game.matrix;
  const l = Game.matrix.length;
  for (let i = 0; i < l; i++) {
    m[i] = Math.random() * 2;
  }
}

// "R-Pentomino" etwa mittig setzen (Startmuster)
function r_Pentomino() {
  const x0 = SPALTEN >>> 1;
  const y0 = ZEILEN >>> 1;
  const m = Game.matrix;
  const getIndex = (x, y) => y * SPALTEN + x;

  m[getIndex(x0 + 1, y0 - 1)] = 1;
  m[getIndex(x0 + 1, y0 - 2)] = 1;
  m[getIndex(x0 + 0, y0 - 2)] = 1;
  m[getIndex(x0 + 1, y0 - 3)] = 1;
  m[getIndex(x0 + 2, y0 - 3)] = 1;
}
const Game = {
  zeilen: ZEILEN,
  spalten: SPALTEN,
  rounds: 0,
  matrix: null,

  // Lookup-Tables für die Nachbarschaften
  rowAbove: null,
  rowBelow: null,
  colLeft: null,
  colRight: null,

  new() {
    const zeilen = this.zeilen;
    const spalten = this.spalten;

    this.matrix = new Uint8Array(zeilen * spalten);
    this.rounds = 0;

    // Zeilenindizes vorberechnen
    const rowAbove = new Int32Array(zeilen);
    const rowBelow = new Int32Array(zeilen);
    for (let y = 0; y < zeilen; y++) {
      rowAbove[y] = y === 0 ? zeilen - 1 : y - 1;
      rowBelow[y] = y === zeilen - 1 ? 0 : y + 1;
      rowAbove[y] *= spalten;
      rowBelow[y] *= spalten;
    }
    this.rowAbove = rowAbove;
    this.rowBelow = rowBelow;

    // Spaltenindizes vorberechnen
    const colLeft = new Int32Array(spalten);
    const colRight = new Int32Array(spalten);
    for (let x = 0; x < spalten; x++) {
      colLeft[x] = x === 0 ? spalten - 1 : x - 1;
      colRight[x] = x === spalten - 1 ? 0 : x + 1;
    }
    this.colLeft = colLeft;
    this.colRight = colRight;
  },

  // Komplettes Feld neu rechnen
  transformMatrix() {
    const zeilen = this.zeilen;
    const spalten = this.spalten;
    const colors = PALETTE.length - 1;
    const old_matrix = this.matrix;
    const new_matrix = new Uint8Array(old_matrix.length);
    const rowAbove = this.rowAbove;
    const rowBelow = this.rowBelow;
    const colLeft = this.colLeft;
    const colRight = this.colRight;
    const colorCycling = (col) => (col < colors ? ++col : 1);

    // Hauptlogik
    let yOffset = 0;
    for (let y = 0; y < zeilen; y++) {
      const yUpOffset = rowAbove[y];
      const yDnOffset = rowBelow[y];

      for (let x = 0; x < spalten; x++) {
        const xL = colLeft[x];
        const xR = colRight[x];

        // Nur die Lebenden zählen
        const neighbours =
          (old_matrix[yUpOffset + xL] ? 1 : 0) + // Links oben
          (old_matrix[yUpOffset + x] ? 1 : 0) + // Oben
          (old_matrix[yUpOffset + xR] ? 1 : 0) + // Rechts oben
          (old_matrix[yOffset + xL] ? 1 : 0) + // Links
          (old_matrix[yOffset + xR] ? 1 : 0) + // Rechts
          (old_matrix[yDnOffset + xL] ? 1 : 0) + // Links unten
          (old_matrix[yDnOffset + x] ? 1 : 0) + // Darunter
          (old_matrix[yDnOffset + xR] ? 1 : 0); // Rechts unten

        // Conway´s Regeln anwenden
        const idx = yOffset + x;
        const val = old_matrix[idx];
        if (val === 0) {
          // Tote Zelle
          if (neighbours === 3) new_matrix[idx]++;
        } else {
          // Lebende Zelle
          if (neighbours === 2 || neighbours === 3)
            new_matrix[idx] = colorCycling(val);
        }
      }
      yOffset += spalten;
    }

    this.rounds++;
    this.matrix = new_matrix;
  },
};

/* ###################################################### UI ################################################## */

// Rundenzähler
class Counter {
  value = 0;
  id = "counter"; //
  text = "Rounds: ";

  constructor() {
    const counter = document.getElementById(this.id);
    counter.textContent = this.text + this.value;
  }
  inc() {
    const counter = document.getElementById(this.id);
    counter.textContent = this.text + this.value++;
  }
  set(x = 0) {
    this.value = x;
    const counter = document.getElementById(this.id);
    counter.textContent = this.text + this.value;
  }
}
const counter = new Counter();

// Tabelle bauen
/*
function viewbox_container(matrix) {
  const container = document.getElementById("viewbox-container");
  container.innerHTML = ""; // Container leeren
  const table = document.createElement("table");

  for (let y = 0; y < ZEILEN; y++) {
    const row = document.createElement("tr");
    for (let x = 0; x < SPALTEN; x++) {
      const idx = getIndex(x, y);
      const value = matrix[idx];
      const cell = document.createElement("td");
      cell.style.backgroundColor = PALETTE[value];
      cell.style.width = CELL_WIDTH;
      cell.style.height = CELL_HEIGHT;
      cell.dataset.x = x;
      cell.dataset.y = y;
      row.appendChild(cell);
    }
    table.appendChild(row);
    // table.style.borderCollapse = "collapse";
    table.style.borderStyle = "dashed";
    table.style.borderWidth = "1px";
    table.style.margin = "1.5rem auto";
  }
  container.appendChild(table);
}

// Editor für Tabelle
function viewbox_container_editor(matrix) {
  const container = document.getElementById("viewbox-container");

  const mouseDraw = (event) => {
    const cell = event.target;
    if (cell.tagName !== "TD") return;
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);
    const idx = getIndex(x, y);

    matrix[idx] = (matrix[idx] + 1) % PALETTE.length;
    cell.style.backgroundColor = PALETTE[matrix[idx]];
  };

  let mouseDown = false;
  document.body.addEventListener("mousedown", () => (mouseDown = true));
  document.body.addEventListener("mouseup", () => (mouseDown = false));
  container.addEventListener("mousedown", mouseDraw);
  container.addEventListener("mouseover", (event) => {
    if (mouseDown) mouseDraw(event);
  });
}

*/

function drawCourt(matrix) {
  const canvas = document.getElementById("court");

  canvas.width = BREITE;
  canvas.height = HOEHE;

  canvas.style.border = "1px dashed gray";
  canvas.style.display = "block";
  canvas.style.margin = "1.5rem auto";

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, BREITE, HOEHE);

  const cellSize = CELL_SIZE + 1;
  let idx = 0;
  for (let y = 0; y < HOEHE; y += cellSize) {
    for (let x = 0; x < BREITE; x += cellSize) {
      const value = matrix[idx];
      ctx.fillStyle = PALETTE[value];
      ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
      idx++;
    }
  }
}

/* ############################################## Setup and run ######################################### */

const Simulation = {
  interval: 0,
  loopPtr: null,
  inProgress: false,

  loop() {
    Game.transformMatrix();
    drawCourt(Game.matrix);
    counter.inc();
  },

  start() {
    this.loopPtr = setInterval(this.loop, this.interval);
    this.inProgress = true;
  },

  stop() {
    clearInterval(this.loopPtr);
    this.inProgress = false;
  },

  reset(mode = "pentomino") {
    this.stop();
    Game.new();
    switch (mode) {
      case "random":
        randomArray();
        break;
      case "pentomino":
        r_Pentomino();
        break;
      default:
        break;
    }
    drawCourt(Game.matrix);
  },
};

Simulation.reset();

// console.time("timer");
// for (let i = 0; i < 100000; i++) {
//   Game.transformMatrix();
//   // drawCourt(Game.matrix);
// }
// console.timeEnd("timer");

/* ############################################## Buttons ######################################### */

// Start/Stop
document.getElementById("control").addEventListener("click", () => {
  const butt = document.getElementById("control");
  if (Simulation.inProgress) {
    Simulation.stop();
    if (Game.rounds === 0) butt.textContent = "Start";
    else butt.textContent = "Continue";
  } else {
    Simulation.start();
    butt.textContent = "Stop";
  }
});

// Reset
document.getElementById("Reset").addEventListener("click", () => {
  Simulation.reset("pentomino");
  counter.set();
  const butt = document.getElementById("control");
  butt.textContent = "Start";
});

// Edit
document.getElementById("Edit").addEventListener("click", () => {
  Simulation.stop();
  const butt = document.getElementById("control");
  butt.textContent = "Continue";
  drawCourt(Game.matrix);
  // viewbox_container_editor(Game.matrix);
});

// Random
document.getElementById("Random").addEventListener("click", () => {
  Simulation.reset("random");
  counter.set();
  const butt = document.getElementById("control");
  butt.textContent = "Start";
});

/* **************************************************************************************

*  Canvas statt Tabelle

*  Was fehlt:
-- Mehr Optionen (Spielfeldgröße und Regeln ändern, Grid an/aus, Farben etc.)
-- Editor (Zoom in/out, predefined Patterns)

*/
