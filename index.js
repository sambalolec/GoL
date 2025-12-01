/* ############################################## Globals ######################################### */

// Farben
const PALETTE = [
  "#000000",
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

// Spielkonfiguration
const config = {
  zeilen: 211,
  spalten: 523,
  updateInterval: 0,
};

/* ############################################## Main ######################################### */

// "R-Pentomino" etwa mittig setzen (Startmuster)
function r_Pentomino() {
  const x0 = config.spalten >>> 1;
  const y0 = config.zeilen >>> 1;
  const m = Game.matrix;
  const getIndex = (x, y) => y * config.spalten + x;

  m[getIndex(x0 + 1, y0 - 1)] = 1;
  m[getIndex(x0 + 1, y0 - 2)] = 1;
  m[getIndex(x0 + 0, y0 - 2)] = 1;
  m[getIndex(x0 + 1, y0 - 3)] = 1;
  m[getIndex(x0 + 2, y0 - 3)] = 1;
}
const Game = {
  rows: config.zeilen,
  cols: config.spalten,
  rounds: 0,
  matrix: null,

  // Lookup-Tables für die Nachbarschaften
  rowAbove: null,
  rowBelow: null,
  colLeft: null,
  colRight: null,

  new() {
    const rows = this.rows;
    const cols = this.cols;

    this.matrix = new Uint8Array(rows * cols);
    this.rounds = 0;

    // Zeilenindizes vorberechnen
    const rowAbove = new Int32Array(rows);
    const rowBelow = new Int32Array(rows);
    for (let y = 0; y < rows; y++) {
      rowAbove[y] = y === 0 ? rows - 1 : y - 1;
      rowBelow[y] = y === rows - 1 ? 0 : y + 1;
      rowAbove[y] *= cols;
      rowBelow[y] *= cols;
    }
    this.rowAbove = rowAbove;
    this.rowBelow = rowBelow;

    // Spaltenindizes vorberechnen
    const colLeft = new Int32Array(cols);
    const colRight = new Int32Array(cols);
    for (let x = 0; x < cols; x++) {
      colLeft[x] = x === 0 ? cols - 1 : x - 1;
      colRight[x] = x === cols - 1 ? 0 : x + 1;
    }
    this.colLeft = colLeft;
    this.colRight = colRight;
  },

  // Komplettes Feld neu rechnen
  update() {
    const zeilen = this.rows;
    const spalten = this.cols;
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

  randomize() {
    const m = Game.matrix;
    const l = Game.matrix.length;
    for (let i = 0; i < l; i++) {
      m[i] = Math.random() * 2;
    }
  },
};

/* ###################################################### Counter ################################################## */

// Rundenzähler
const counter = {
  value: 0,
  id: "counter",
  text: "Rounds: ",

  inc() {
    const counter = document.getElementById(this.id);
    counter.textContent = this.text + this.value++;
  },
  set(x = 0) {
    this.value = x;
    const counter = document.getElementById(this.id);
    counter.textContent = this.text + this.value;
  },
};

/* ###################################################### Spielfeld malen ################################################## */

class Display {
  worker = new Worker("canvas.js");
  cellSize = 2;

  constructor(cols, rows, palette) {
    const width = (this.cellSize + 1) * cols;
    const height = (this.cellSize + 1) * rows;
    const worker = this.worker;
    const canvas = document.getElementById("court");

    canvas.width = width;
    canvas.height = height;
    canvas.style.border = "1px dashed gray";
    canvas.style.margin = "1.5rem auto";
    const offscreen = canvas.transferControlToOffscreen();

    const palette_RGB = palette.map((hex) => {
      const v = parseInt(hex.slice(1), 16);
      return [(v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff];
    });

    worker.postMessage(
      {
        type: "init",
        canvas: offscreen,
        width: width,
        height: height,
        cellSize: this.cellSize,
        palette: palette_RGB,
      },
      [offscreen]
    );
  }

  render(matrix) {
    const mx = new Uint8Array(matrix);
    this.worker.postMessage(
      {
        type: "draw",
        matrix: mx,
      },
      [mx.buffer]
    );
  }
}

/* ############################################## Setup and run ######################################### */

const Simulation = {
  updateInterval: config.updateInterval,
  lastTime: 0,
  inProgress: false,

  loop(time) {
    if (!Simulation.inProgress) return;
    if (time - Simulation.lastTime >= Simulation.updateInterval) {
      Simulation.lastTime = time;

      display.render(Game.matrix);
      counter.inc();
      Game.update();
    }
    requestAnimationFrame(Simulation.loop);
  },

  start() {
    Simulation.inProgress = true;
    Simulation.lastTime = performance.now();
    requestAnimationFrame(Simulation.loop);
  },

  stop() {
    Simulation.inProgress = false;
  },

  reset(mode = "pentomino") {
    Simulation.stop();
    Game.new();
    counter.set();
    switch (mode) {
      case "random":
        Game.randomize();
        break;
      case "pentomino":
        r_Pentomino();
        break;
      default:
        break;
    }
    display.render(Game.matrix);
  },
};

const display = new Display(config.spalten, config.zeilen, PALETTE);
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
  const butt = document.getElementById("control");
  butt.textContent = "Start";
});

// Edit
document.getElementById("Edit").addEventListener("click", () => {
  Simulation.stop();
  const butt = document.getElementById("control");
  butt.textContent = "Continue";
  display.render(Game.matrix);
  // viewbox_container_editor(Game.matrix);
});

// Random
document.getElementById("Random").addEventListener("click", () => {
  Simulation.reset("random");
  const butt = document.getElementById("control");
  butt.textContent = "Start";
});

/* **************************************************************************************

*  Performance: Canvas als Workerthread verpackt, Rendering via ImageData statt fillRect.
*  Farbpalette: Altes Datenformat wieder eingeführt, weil einfach schönerer Code. Umrechnung in RGB beim Initialisieren des Workers. 

*  Was fehlt:
-- Mehr Optionen (Spielfeldgröße und Regeln ändern, Grid an/aus, Farben etc.)
-- Editor (Zoom in/out, predefined Patterns)

*/
