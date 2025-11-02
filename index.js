/************************************************** User defined Vars *******************************************/
// Farben
const palette = [
  "#000000", //Grundfarbe! Nicht ändern.
  "#00ffff",
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
  "#ffffff",
];

// Tabellenformat
// const zeilen = 45;
// const spalten = 110;
const width = "12px";
const height = width;

// Farbwechsel
const colorCycling = true;

// Speed
const intervall = 1;

//
const Game = {
  zeilen: 45,
  spalten: 110,
  defaultColor: 10, // Defaultfarbe für die Zellen
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
    const defaultColor = this.defaultColor;
    const colors = palette.length - 1;
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
          if (dy === 0 && dx === 0) continue;
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
          if (neighbours === 3) new_matrix[y][x] = defaultColor; // Bei exakt 3 lebenden Nachbarn befruchten
        } else {
          // Zelle lebt
          if (neighbours === 2 || neighbours === 3)
            if (colorCycling === true)
              // Darf weiterleben
              new_matrix[y][x] = cycleCol(old_matrix[y][x]);
            else new_matrix[y][x] = defaultColor;
        }
      }
    }
    this.rounds++;
    this.matrix = new_matrix;
  },
};

/********************************************************* UI *********************************************/

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

    matrix[y][x] = (matrix[y][x] + 1) % palette.length;
    cell.style.backgroundColor = palette[matrix[y][x]];
  };

  let mouseDown = false;
  document.body.addEventListener("mousedown", () => (mouseDown = true));
  document.body.addEventListener("mouseup", () => (mouseDown = false));

  container.addEventListener("mousedown", mouseDraw);
  container.addEventListener("mouseover", (event) => {
    if (mouseDown === true) mouseDraw(event);
  });
}

/************************************************* Setup and run ******************************** */

// R-pentomino bauen
function r_Pentomino() {
  const x0 = Game.spalten >>> 1;
  const y0 = Game.zeilen >>> 1;
  Game.matrix[y0 - 1][x0 + 1] = Game.defaultColor;
  Game.matrix[y0 - 2][x0 + 1] = Game.defaultColor;
  Game.matrix[y0 - 2][x0 + 0] = Game.defaultColor;
  Game.matrix[y0 - 3][x0 + 1] = Game.defaultColor;
  Game.matrix[y0 - 3][x0 + 2] = Game.defaultColor;
}

// Mainloop
function run() {
  Game.transformMatrix();
  viewport_container(Game.matrix);
  const counter = document.getElementById("counter");
  counter.textContent = "Rounds: " + Game.rounds;
}

Game.new();
r_Pentomino();
let loop = null;
let started = false;
viewport_container(Game.matrix); // Erstes Bild zeigen (r-Pentomino)

/*********************************************** Buttons *******************************/

// Start/Stop
document.getElementById("control").addEventListener("click", () => {
  const butt = document.getElementById("control");
  if (!started) {
    loop = setInterval(run, intervall); // <============ Mainloop setzen
    started = true;
    butt.textContent = "Stop";
  } else {
    started = false;
    clearInterval(loop);

    if (Game.rounds === 0) butt.textContent = "Start";
    else butt.textContent = "Continue";
  }
});

// Reset to defaults
document.getElementById("Reset").addEventListener("click", () => {
  clearInterval(loop);
  started = false;
  Game.new();
  const counter = document.getElementById("counter");
  counter.textContent = "Rounds: " + Game.rounds;
  const butt = document.getElementById("control");
  butt.textContent = "Start";
  r_Pentomino();
  viewport_container(Game.matrix);
});

// Editbutton
document.getElementById("Edit").addEventListener("click", () => {
  clearInterval(loop);
  started = false;
  const counter = document.getElementById("counter");
  counter.textContent = "Rounds: " + Game.rounds;
  const butt = document.getElementById("control");
  butt.textContent = "Continue";
  viewport_container(Game.matrix);
  viewport_container_editor(Game.matrix);
});

/*******************************************************************************

Editor funktioniert, aber ist sicher noch ausbaufähig.
Kleinigkeiten wurden geändert.

Fehlt noch:
- Funktion transformMatrix ineffizient, muss knackiger werden
- Random-Fill
- Rulemanagement
- Was wo man draufklickt und dann was zu lesen kriegt
- Makeup

********************************************************************************/

/**************************************** Spielplatz *************************** */
