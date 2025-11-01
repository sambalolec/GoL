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
// const zeilen = 45;
// const spalten = 110;
const width = "12px";
const height = width;

// Farben
// const defaultColor = 11; // Defaultfarbe für Zellen
const colorCycling = true;

// Speed
const intervall = 50;

const Game = {
  zeilen: 45,
  spalten: 110,
  defaultColor: 11,
  rounds: 0,
  matrix: null,

  new() {
    this.matrix = Array.from({ length: this.zeilen }, () =>
      Array(this.spalten).fill(0)
    );
    this.rounds = 0;
  },
  transformMatrix() {
    // Wrapper horizontal
    const x_ = (val) => {
      let out = val;
      if (val >= this.spalten) out = 0;
      if (val < 0) out = this.spalten - 1;
      return out;
    };
    // Wrapper vertikal
    const y_ = (val) => {
      let out = val;
      if (val >= this.zeilen) out = 0;
      if (val < 0) out = this.zeilen - 1;
      return out;
    };
    // Farbpalette durchgehen
    const cycleCol = (col) => {
      if (col < palette.length - 1) return col + 1;
      else return 1;
    };

    let m = Array(this.zeilen)
      .fill(0)
      .map(() => Array(this.spalten).fill(0));

    for (let y = 0; y < this.zeilen; y++) {
      for (let x = 0; x < this.spalten; x++) {
        let neighbours = 0;

        // Nachbarn an den Flächen zählen
        if (this.matrix[y_(y + 1)][x_(x)] !== 0) neighbours += 1; //Oben
        if (this.matrix[y_(y - 1)][x_(x)] !== 0) neighbours += 1; //Unten
        if (this.matrix[y_(y)][x_(x + 1)] !== 0) neighbours += 1; //Rechts
        if (this.matrix[y_(y)][x_(x - 1)] !== 0) neighbours += 1; //Links

        // Nachbarn an den Ecken zählen
        if (this.matrix[y_(y + 1)][x_(x + 1)] !== 0) neighbours += 1; //Oben Rechts
        if (this.matrix[y_(y + 1)][x_(x - 1)] !== 0) neighbours += 1; //Oben Links
        if (this.matrix[y_(y - 1)][x_(x + 1)] !== 0) neighbours += 1; //Unten Rechts
        if (this.matrix[y_(y - 1)][x_(x - 1)] !== 0) neighbours += 1; //Unten Links

        // Standardregeln anwenden
        if (this.matrix[y][x] === 0) {
          //Zelle tot
          if (neighbours === 3) m[y][x] = 10;
        } else {
          // Zelle lebt
          if (neighbours === 2 || neighbours === 3)
            if (colorCycling === true) m[y][x] = cycleCol(this.matrix[y][x]);
            else m[y][x] = 10;
        }
      }
    }
    this.rounds += 1;
    return m;
  },
};

/************************************************* Setup ******************************** */

Game.new();

// R-pentomino bauen, für Testing
function r_Pentomino() {
  const x0 = Game.spalten >>> 1;
  const y0 = Game.zeilen >>> 1;
  Game.matrix[y0 - 1][x0 + 1] = Game.defaultColor;
  Game.matrix[y0 - 2][x0 + 1] = Game.defaultColor;
  Game.matrix[y0 - 2][x0 + 0] = Game.defaultColor;
  Game.matrix[y0 - 3][x0 + 1] = Game.defaultColor;
  Game.matrix[y0 - 3][x0 + 2] = Game.defaultColor;
}
r_Pentomino();

/********************************************************* Output *********************************************/

function start() {
  Game.matrix = Game.transformMatrix();
  viewport_container(Game.matrix);
  const counter = document.getElementById("counter");
  counter.textContent = "Runden: " + Game.rounds;
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
viewport_container(Game.matrix); // Erstes Bild

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

// Resetbutton
document.getElementById("Reset").addEventListener("click", () => {
  Game.new();
  r_Pentomino();
  viewport_container(Game.matrix);
  const counter = document.getElementById("counter");
  counter.textContent = "Runden: " + Game.rounds;
});

/*******************************************************************************

Spiel läuft soweit, scheinbar fehlerfrei.
Rundenzähler ist drin.
Reset-Button jetzt mit Funktion

Fehlt noch:
- Editor
- Rulemanagement
- Was wo man draufklickt und dann was zu lesen kriegt
- Makeup

********************************************************************************/
