import { Vec4 } from "wgpu-matrix";
import { BYTES_PER_FLOAT, WebGpuContext } from "../lib/types";
import { getCode } from "../wgsl/blocks";
import { makePingPongCompute } from './ping-pong-compute';

const PER_WORKGROUP = 64

// https://webgpufundamentals.org/webgpu/lessons/resources/wgsl-offset-computer.html#x=5d000001000e01000000000000003d888b0237284d3025f2381bcb288a12586ca9aaf3e2141e0b08d95d9f7fc44c3e4ece44c5e39ae8138cfead4b37212a057c25e28fdcddd929f3f405b5688038f9a2d7e12d60b5c5dd0992a0de81faa09dd402f3ae4d29b417084304a37b17f8a2ef26fb2d8b8214018ea8aaf1dd23be33fbca440cd8df6a11537fa48a3af69b6770bcdc333d7d8ba77169042e3582201f6f7ffae8d2774bd17b4198c91f59062f04b7a400fff85abc0b
const PARAMETERS_BYTE_LENGTH = 48

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
  gravity:       number
  seed:          Vec4
  speed:         number
}

type WormsCompute = [
  compute:          (encoder: GPUCommandEncoder, pingPong: 0 | 1, deltaTime: number) => void,
  updateParameters: (parameters: WormsComputeParameters) => void,
]

/**
 * Wraps PingPongCompute to generate a WormsCompute that iterates the worms' positions.
 */
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

  function updateParameters(params: WormsComputeParameters): void {
    const { exaggeration, seed, deltaRotation, speed, gravity } = params
    parametersArray.set([deltaRotation, exaggeration, speed, ...seed, gravity], 1) // offset by 1 to avoid overwriting deltaTime.
  }
}
