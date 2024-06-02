import { mat4, vec3 } from "wgpu-matrix";
import { degToRad } from "../math";
import { WebGpuContext, WindowSize } from "../types";
import { getCode } from "../wgsl/blocks";
import { createBufferWithUpdate } from "./create-buffer";
import { SphericalCoords, sphericalToCartesian } from "./spherical-coords";

const UP = vec3.create(0, 1, 0)
const ORIGIN = vec3.create(0, 0, 0)
const COLOR_ATTACHMENTS = { clearValue: [0, 0, 0, 0], loadOp: 'clear', storeOp: 'store' } as const
const BACKGROUND = vec3.create(0.9, 0.9, 0.9)

interface Props {
  buffers:               [GPUBuffer, GPUBuffer]
  context:               WebGpuContext
  count:                 number
  initialParameters:     WormsRenderParameters
  initialSimulationData: Float32Array
}

export interface WormsRenderParameters {
  camera:      SphericalCoords
  light:       SphericalCoords
  size:        WindowSize
  fov:         number
  smoothUnion: number
}

type Render = [
  render:           (encoder: GPUCommandEncoder, pingPong: 0 | 1) => void,
  updateParameters: (state: WormsRenderParameters) => void,
]


/**
 * Constructs a render pipeline.
 *
 * TODO: This is tightly coupled to the example with vertex and fragment shaders right now. Some metadata about the
 * structure of the WGSL code needs to be included in the props to make this more flexible (potentially the whole of
 * the `createRenderPipeline` object is that metadata?!)
*/
export function makeWormsRender(props: Props): Render {
  const { buffers, context, count, initialParameters, initialSimulationData } = props;
  const { device, format, context: gpuContext } = context

  const module = device.createShaderModule({ code: getCode('worms-render', { WORMS_COUNT: `${count}` }) })

  const [parameters, updateBuffer] = createBufferWithUpdate({
    context,
    initial: getRenderParameters(initialParameters),
    usage:   GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  })

  const layout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: { type: 'uniform' },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT,
        buffer: { type: 'read-only-storage' },
      }
    ]
  })

  const pipeline = device.createRenderPipeline({
    fragment:  { entryPoint: 'fs_main', module, targets: [{ format }] },
    layout:    device.createPipelineLayout({ bindGroupLayouts: [layout] }),
    primitive: { topology: 'triangle-strip' },
    vertex:    { entryPoint: 'vs_main', module },
  })

  const groups = buffers.map(makeGroup)

  return [compute, update]

  function compute(encoder: GPUCommandEncoder, pingPong: 0 | 1): void {
    const view = gpuContext.getCurrentTexture().createView()

    const passEncoder = encoder.beginRenderPass({ colorAttachments: [{ ...COLOR_ATTACHMENTS, view }] });
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, groups[pingPong]);
    passEncoder.draw(4, 1, 0, 0);
    passEncoder.end();
  }

  function update(state: WormsRenderParameters): void {
    updateBuffer(getRenderParameters(state))
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
      ],
    })
  }
}


function getRenderParameters(props: WormsRenderParameters): Float32Array {
  const { camera, light, size, fov, smoothUnion } = props
  const { width, height } = size

  const cameraXYZ = sphericalToCartesian({
    phi:    degToRad(camera.phi),
    radius: camera.radius,
    theta:  degToRad(camera.theta),
  })

  const lightXYZ = sphericalToCartesian({
    phi:    degToRad(light.phi),
    radius: light.radius,
    theta:  degToRad(light.theta),
  })

  const sceneViewMatrix = mat4.create();
  mat4.lookAt(cameraXYZ, ORIGIN, UP, sceneViewMatrix);
  mat4.invert(sceneViewMatrix, sceneViewMatrix);

  return new Float32Array([...sceneViewMatrix, ...lightXYZ, 0, ...BACKGROUND, 0, width, height, fov, smoothUnion]);
}
