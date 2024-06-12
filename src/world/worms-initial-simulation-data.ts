import chroma from "chroma-js"
import { vec3 } from "wgpu-matrix"
import { repeat } from "../lib/arrays"
import { degToRad } from "../lib/math"
import { BYTES_PER_FLOAT } from "../lib/types"

const RADIUS = 1.0
const SIZE = 10

// https://webgpufundamentals.org/webgpu/lessons/resources/wgsl-offset-computer.html#x=5d00000100f000000000000000003d888b0237284d3025f2381bcb288b3dbea07e420280ae88594419ea49c4928d66f53fb96619af9eb0a13d08f792f0a1f4f156d6eef7630abfcb25142147ad17d93303fc8143fb75e39b13cb6dc1200f4eb2252617641a039ef002836ce849715386ed2db2f4593f63e5c419af48013327fcad450d6832871c32e3899fe61acf41cb2e2db353f10f1550866f3c8c897817dd4b42bd63bccab8cc2b18094475550d7e0ac36fdfff34cebb00
const BYTES_PER_WORM = 112

const FLOATS_PER_WORM = BYTES_PER_WORM / BYTES_PER_FLOAT

const RAINBOW = chroma.scale(['#ff0000','#ff8800','#FFEE00','#00FF00', '#1E90FF', '#0000CD', '#9900FF']).mode('hsl');

/**
 * Creates the initial state for the simulation data. Note that the structure of each Float32Array in `addWorm` must
 * correspond to the structure per the webgpufundamentals.org link, above.
 */
export function makeWormsInitialSimulationData(count: number): Float32Array {
  const array = new Float32Array(count * BYTES_PER_WORM)
  const colors = RAINBOW.colors(count)

  for (let i = 0; i < count; i++) addWorm(i)
  return array

  function addWorm(index: number): void {
    const phi = degToRad(360 * rnd() - 180)
    const theta = degToRad(360 * rnd())
    const position = vec3.create(rnd() * SIZE, rnd() * SIZE, rnd() * SIZE)
    const [r, g, b] = chroma(colors[index]).gl()

    const data = new Float32Array([
      ...position, 0,
      ...position, 0,
      ...position, 0,
      ...repeat([theta, phi], 5), 0, 0,
      r, g, b, RADIUS,
    ])
    array.set(data, index * FLOATS_PER_WORM)
  }
}

function rnd(): number {
  return 2 * Math.random() - 1
}
