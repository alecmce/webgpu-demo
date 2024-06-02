import { WebGpuContext } from "../types"
import { createBufferWithUpdate } from "./create-buffer"

interface Props {
  buffers:               [GPUBuffer, GPUBuffer]
  module:                GPUShaderModule
  context:               WebGpuContext
  initialParameters:     Float32Array
  initialSimulationData: Float32Array
  workgroupCount:        number
}

export type PingPongCompute = [
  compute:          (encoder: GPUCommandEncoder, pingPong: 0 | 1) => void,
  updateParameters: (data: Float32Array) => void,
]

export function makePingPongCompute(props: Props): PingPongCompute {
  const { buffers, context, initialParameters, initialSimulationData, module, workgroupCount } = props
  const { device } = context

  const [parameters, updateParameters] = createBufferWithUpdate({
    context,
    initial: initialParameters,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  })

  const pipeline = device.createComputePipeline({ compute: { module }, layout: 'auto' })
  const groups = buffers.map(makeGroup)

  return [compute, updateParameters]

  function compute(encoder: GPUCommandEncoder, pingPong: 0 | 1): void {
    const passEncoder = encoder.beginComputePass({});
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, groups[pingPong]);
    passEncoder.dispatchWorkgroups(workgroupCount);
    passEncoder.end();
  }

  function makeGroup(_: unknown, index: number): GPUBindGroup {
    const dataSize = initialSimulationData.byteLength

    return device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: { buffer: parameters },
        },
        {
          binding: 1,
          resource: { buffer: buffers[index], offset: 0, size: dataSize },
        },
        {
          binding: 2,
          resource: { buffer: buffers[(index + 1) % 2], offset: 0, size: dataSize },
        },
      ],
    })
  }
}
