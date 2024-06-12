import { WebGpuContext } from "../lib/types"
import { createBuffer } from "./create-buffer"

interface Props {
  context:               WebGpuContext
  initialSimulationData: Float32Array
}

export function makePingPongBuffers(props: Props): [GPUBuffer, GPUBuffer] {
  const { context, initialSimulationData } = props

  return [makeBuffer(0), makeBuffer(1)]

  function makeBuffer(index: number): GPUBuffer {
    return createBuffer({
      context,
      init,
      initial:          initialSimulationData,
      label:            `Worms[${index}]`,
      mappedAtCreation: true,
      usage:            GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE,
    })
  }
}

function init(buffer: GPUBuffer, data: Float32Array): void {
  // await buffer.mapAsync(GPUMapMode.WRITE); // Is this needed?
  const arrayBuffer = buffer.getMappedRange();
  new Float32Array(arrayBuffer).set(data)
  buffer.unmap();
}
