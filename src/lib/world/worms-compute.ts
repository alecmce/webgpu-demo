import { Vec4 } from "wgpu-matrix";
import { BYTES_PER_FLOAT, WebGpuContext } from "../types";
import { getCode } from "../wgsl/blocks";
import { makePingPongCompute } from './ping-pong-compute';

const PER_WORKGROUP = 64

// https://webgpufundamentals.org/webgpu/lessons/resources/wgsl-offset-computer.html#x=5d00000100f600000000000000003d888b0237284d3025f2381bcb288a12586ca9aaf3e2141e0b08d95d9f7fc44c3e4ece44c5e39ae8138cfead4b37212a057c25e28fdcddd929f3f405b5688038f9a2d7e12d60b5c5dd0992a0de81faa09dd402f3ae4d29b3e4667b3e2b2b1a017266abf134c6b5f6cc3a7c8395ac366e52e6c4a762c89d8a0f9974f89a6837a80f79109a4e8ffa1ea5134eb0618a2368c89ccfc017bf48a3fa604560ffed771500
const PARAMETERS_BYTE_LENGTH = 32

const PARAMETERS_FLOAT_LENGTH = PARAMETERS_BYTE_LENGTH / BYTES_PER_FLOAT

interface Props {
  buffers:               [GPUBuffer, GPUBuffer]
  context:               WebGpuContext
  initialParameters:     WormsComputeParameters
  initialSimulationData: Float32Array
  count:                 number
}

export interface WormsComputeParameters {
  deltaRotation: number
  exaggeration:  number
  seed:          Vec4
  speed:         number
}

export type WormsCompute = [
  compute:          (encoder: GPUCommandEncoder, pingPong: 0 | 1, deltaTime: number) => void,
  updateParameters: (parameters: WormsComputeParameters) => void,
]

/** Wraps PingPongCompute to generate a WormsCompute. */
export function makeWormsCompute(props: Props): WormsCompute {
  const { buffers, context, count, initialSimulationData, initialParameters } = props

  const parametersArray = new Float32Array(PARAMETERS_FLOAT_LENGTH)
  updateParameters(initialParameters)

  const module = context.device.createShaderModule({ code: getCode('worms-compute') })

  const [pingPongCompute, pingPongUpdate] = makePingPongCompute({
    buffers,
    context,
    initialParameters:     parametersArray,
    initialSimulationData,
    module,
    workgroupCount:        Math.ceil(count / PER_WORKGROUP)
  })

  return [compute, updateParameters]

  function compute(encoder: GPUCommandEncoder, pingPong: 0 | 1, deltaTime: number): void {
    parametersArray.set([deltaTime], 0)
    pingPongUpdate(parametersArray)
    pingPongCompute(encoder, pingPong)
  }

  function updateParameters(params: Omit<WormsComputeParameters, 'seed'>): void {
    const { exaggeration, seed, deltaRotation, speed } = { ...initialParameters, ...params }
    parametersArray.set([deltaRotation, exaggeration, speed, ...seed], 1) // offset by 1 to avoid overwriting deltaTime.
  }
}
