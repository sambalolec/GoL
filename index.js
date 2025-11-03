/* ############################################## Globals ######################################### */
// Farben
const PALETTE = [
  "#000000", // Index 0 ist Farbe für tote Zellen.
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

// Tabellenformat
const ZEILEN = 45;
const SPALTEN = 110;
const CELL_WIDTH = "12px";
const CELL_HEIGHT = CELL_WIDTH;

/* ############################################## Main ######################################### */

const Game = {
  zeilen: ZEILEN,
  spalten: SPALTEN,
  rounds: 0,
  matrix: [],

  new() {
    this.matrix = Array.from({ length: this.zeilen }, () =>
      Array(this.spalten).fill(0)
    );
    this.rounds = 0;
  },

  transformMatrix() {
    const zeilen = this.zeilen;
    const spalten = this.spalten;
    const colors = PALETTE.length - 1;
    const old_matrix = this.matrix;
    const new_matrix = Array(zeilen)
      .fill(0)
      .map(() => Array(spalten).fill(0));

    // Lebende Nachbarn zählen
    const count = (y, x) => {
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = (y + dy + zeilen) % zeilen;
        for (let dx = -1; dx <= 1; dx++) {
          if (dy === 0 && dx === 0) continue; // sich selbst nicht mitzählen.
          const xx = (x + dx + spalten) % spalten;
          if (old_matrix[yy][xx] !== 0) n++;
        }
      }
      return n;
    };

    // Farbpalette durchgehen (Entwurf)
    const cycleCol = (col) => {
      if (col < colors) return ++col;
      return 1;
    };

    // Regeln auf alle Zellen anwenden
    for (let y = 0; y < zeilen; y++) {
      for (let x = 0; x < spalten; x++) {
        const neighbours = count(y, x);

        // Für´s Erste nur klassische Regeln
        if (old_matrix[y][x] === 0) {
          //Zelle tot
          if (neighbours === 3) new_matrix[y][x] = 1; // Bei exakt 3 lebenden Nachbarn befruchten
        } else {
          // Zelle lebt
          if (neighbours === 2 || neighbours === 3)
            // Zelle updaten
            new_matrix[y][x] = cycleCol(old_matrix[y][x]);
        }
      }
    }
    this.rounds++;
    this.matrix = new_matrix;
  },
};

/* ############################################## Setup and run ######################################### */

// R-pentomino in Matrix poppen
function r_Pentomino() {
  const x0 = SPALTEN >>> 1;
  const y0 = ZEILEN >>> 1;
  const m = Game.matrix;
  m[y0 - 1][x0 + 1] = 1;
  m[y0 - 2][x0 + 1] = 1;
  m[y0 - 2][x0 + 0] = 1;
  m[y0 - 3][x0 + 1] = 1;
  m[y0 - 3][x0 + 2] = 1;
}

const Simulation = {
  interval: 0,
  loopPtr: null,
  inProgress: false,

  start() {
    this.loopPtr = setInterval(this.loop, this.interval);
    this.inProgress = true;
  },

  stop() {
    clearInterval(this.loopPtr);
    this.inProgress = false;
  },

  loop() {
    Game.transformMatrix();
    viewport_container(Game.matrix);
    counter.count();
  },

  reset() {
    this.stop();
    Game.new();
    r_Pentomino();
    viewport_container(Game.matrix);
  },
};

Simulation.reset();

/* ###################################################### UI ################################################## */

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
      cell.style.backgroundColor = PALETTE[value];
      cell.style.width = CELL_WIDTH;
      cell.style.height = CELL_HEIGHT;

      cell.dataset.x = x;
      cell.dataset.y = y;
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

// Symboleditor
function viewport_container_editor(matrix) {
  const container = document.getElementById("viewbox-container");

  const mouseDraw = (event) => {
    const cell = event.target;
    if (cell.tagName !== "TD") return;

    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);

    matrix[y][x] = (matrix[y][x] + 1) % PALETTE.length;
    cell.style.backgroundColor = PALETTE[matrix[y][x]];
  };

  let mouseDown = false;
  document.body.addEventListener("mousedown", () => (mouseDown = true));
  document.body.addEventListener("mouseup", () => (mouseDown = false));

  container.addEventListener("mousedown", mouseDraw);
  container.addEventListener("mouseover", (event) => {
    if (mouseDown === true) mouseDraw(event);
  });
}

// Rundenzähler
class Counter {
  value = 0;
  name = "counter";
  text = "Rounds: ";

  constructor() {
    const counter = document.getElementById(this.name);
    counter.textContent = this.text + this.value;
  }
  count() {
    const counter = document.getElementById(this.name);
    counter.textContent = this.text + this.value++;
  }
  set(x = 0) {
    this.value = x;
    const counter = document.getElementById(this.name);
    counter.textContent = this.text + this.value;
  }
}
const counter = new Counter();

// ---------------------------------------------  Buttons ----------------------------------------------------- //

// Start/Stop-Button
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

// Resetbutton
document.getElementById("Reset").addEventListener("click", () => {
  Simulation.reset();
  counter.set();
  const butt = document.getElementById("control");
  butt.textContent = "Start";
});

// Editbutton
document.getElementById("Edit").addEventListener("click", () => {
  Simulation.stop();
  const butt = document.getElementById("control");
  butt.textContent = "Continue";
  viewport_container(Game.matrix);
  viewport_container_editor(Game.matrix);
});

/*******************************************************************************

Aufgeräumt.

Fehlt noch:
- Random-Fill
- Rulemanagement
- Was wo man draufklickt und dann was zu lesen kriegt
- Paar mehr Knöppe und Makeup

********************************************************************************/

/**************************************** Spielplatz *************************** */
