let ctx, width, height, cellSize, palette, cellBoarder;

self.onmessage = function (e) {
  const msg = e.data;

  switch (msg.type) {
    case "draw":
      render(msg.matrix);
      break;

    case "init":
      const canvas = msg.canvas;
      ctx = canvas.getContext("2d");
      width = msg.width;
      height = msg.height;
      cellSize = msg.cellSize;
      cellBoarder = cellSize + 1;
      palette = msg.palette;
      break;
  }
};

function render(matrix) {
  const img = ctx.createImageData(width, height);
  const data = img.data;

  let idx = 0;
  for (let y = 0; y < height; y += cellBoarder) {
    for (let x = 0; x < width; x += cellBoarder) {
      const [r, g, b] = palette[matrix[idx++]];

      for (let dy = 0; dy < cellSize; dy++) {
        const base = (y + dy) * width + x;
        for (let dx = 0; dx < cellSize; dx++) {
          const i = (base + dx) << 2;
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = 255;
        }
      }
    }
  }

  ctx.putImageData(img, 0, 0);
}
