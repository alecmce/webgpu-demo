import { WebGpuContext } from "../lib/types"

interface Props {
  context:           WebGpuContext
  init?:             (buffer: GPUBuffer, data: Float32Array) => void
  initial:           Float32Array
  label?:            string
  mappedAtCreation?: true
  usage:             GPUBufferUsageFlags
}

type BufferWithUpdate = [parameters: GPUBuffer, updateParameters: (data: Float32Array) => void]

export function createBuffer(props: Props): GPUBuffer {
  const { context, init = updateBuffer, initial, label, mappedAtCreation, usage } = props
  const { adapter, device } = context

  const minSize = adapter.limits.minUniformBufferOffsetAlignment
  const size = Math.ceil(initial.byteLength / minSize) * minSize
  const buffer = device.createBuffer({ label, mappedAtCreation, size, usage });
  init(buffer, initial)
  return buffer

  function updateBuffer(buffer: GPUBuffer, data: Float32Array): void {
    device.queue.writeBuffer(buffer, 0, data)
  }
}

export function createBufferWithUpdate(props: Props): BufferWithUpdate {
  const { context: { device } } = props

  const buffer = createBuffer(props)

  return [buffer, update]

  function update(data: Float32Array): void {
    device.queue.writeBuffer(buffer, 0, data)
  }
}
