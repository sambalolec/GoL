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
const ZEILEN = 129;
const SPALTEN = 128;
const CELL_WIDTH = "3px";
const CELL_HEIGHT = CELL_WIDTH;

/* ############################################## Utility ######################################### */

// Berechnet Index für flaches Array aus 2D-Koordinaten
function getIndex(x, y) {
  // return y * SPALTEN + x;
  return (y << 7) + x; // nur für Breite 128!
}

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

  // Game initialisieren
  new() {
    this.matrix = new Uint8Array(this.zeilen * this.spalten);
    this.rounds = 0;
  },

  // Komplettes Feld neu rechnen
  transformMatrix() {
    const zeilen = this.zeilen;
    const spalten = this.spalten;
    const colors = PALETTE.length - 1;
    const old_matrix = this.matrix;
    const new_matrix = new Uint8Array(zeilen * spalten);

    // Die lebenden Nachbarn zählen
    const count = (y, x) => {
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = (y + dy + zeilen) % zeilen;
        for (let dx = -1; dx <= 1; dx++) {
          if (dy === 0 && dx === 0) continue; // sich selbst nicht mitzählen
          const xx = (x + dx + spalten) % spalten;
          if (old_matrix[getIndex(xx, yy)] !== 0) n++;
        }
      }
      return n;
    };

    // Farbpalette durchgehen und die 0 auslassen
    const cycleCol = (col) => (col < colors ? ++col : 1);

    // Regeln auf alle Zellen anwenden (Originalregeln von Conway)
    for (let y = 0; y < zeilen; y++) {
      for (let x = 0; x < spalten; x++) {
        const idx = getIndex(x, y);
        const neighbours = count(y, x);
        const val = old_matrix[idx];

        if (val === 0) {
          // Tote Zelle
          if (neighbours === 3) new_matrix[idx] = 1;
        } else {
          // Lebende Zelle
          if (neighbours === 2 || neighbours === 3)
            new_matrix[idx] = cycleCol(val);
        }
      }
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

/* ############################################## Setup and run ######################################### */

const Simulation = {
  interval: 0,
  loopPtr: null,
  inProgress: false,

  loop() {
    Game.transformMatrix();
    viewbox_container(Game.matrix);
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
    viewbox_container(Game.matrix);
  },
};

Simulation.reset();

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
  viewbox_container(Game.matrix);
  viewbox_container_editor(Game.matrix);
});

// Random
document.getElementById("Random").addEventListener("click", () => {
  Simulation.reset("random");
  counter.set();
  const butt = document.getElementById("control");
  butt.textContent = "Start";
});

/* **************************************************************************************

*  An Performance geschraubt:
-- Game.transformMatrix - Vollständige Umstellung auf eindimensionales typisiertes Array.
-- Supportfunktion "getIndex(x, y)" als Interface für dir alten Funktionen

*  Was fehlt:
-- Funktion RandomArray
-- Mehr Optionen (Spielfeldgröße und Regeln ändern, Grid an/aus, Farben etc.)
-- Besserer Editor (Zoom in/out, predefined Patterns)

*/
