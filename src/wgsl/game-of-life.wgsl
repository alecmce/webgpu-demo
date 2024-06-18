@binding(0) @group(0) var<storage, read>       size: vec2<u32>;
@binding(1) @group(0) var<storage, read>       readCells: array<Cell>;
@binding(2) @group(0) var<storage, read_write> writeCells: array<Cell>;

const COUN

struct Parameters {
  rule: array<array<u32>>;
  fade: f32;
}

struct Cell {
  color:  vec3<f32>;
  alive:  u32;
  warmth: f32;
}

override blockSize = 8;

fn getIndex(x: u32, y: u32) -> u32 {
  let width = size.x;
  let height = size.y;
  return (y % height) * width + (x % width);
}

fn getCell(x: u32, y: u32) -> Cell {
  return readCells[getIndex(x, y)];
}

fn countNeighbors(x: u32, y: u32) -> u32 {
  return getCell(x - 1, y - 1) + getCell(x, y - 1) + getCell(x + 1, y - 1) +
         getCell(x - 1, y) +                         getCell(x + 1, y) +
         getCell(x - 1, y + 1) + getCell(x, y + 1) + getCell(x + 1, y + 1);
}

@compute @workgroup_size(blockSize, blockSize)
fn main(@builtin(global_invocation_id) grid: vec3u) {
  let x = grid.x;
  let y = grid.y;
  let n = countNeighbors(x, y);
  writeCells[getIndex(x, y)] = select(u32(n == 3u), u32(n == 2u || n == 3u), getCell(x, y) == 1u);
}
