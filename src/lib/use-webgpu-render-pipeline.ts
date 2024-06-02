import { useMemo } from "react";
import { WebGpuContext, WebGpuPipeline } from "./types";

interface Props {
  code:    string
  context: WebGpuContext | null
}

export interface GPURenderPipeline {
  bindGroup: GPUBindGroup
}


/**
 * Constructs a render pipeline.
 *
 * TODO: This is tightly coupled to the example with vertex and fragment shaders right now. Some metadata about the
 * structure of the WGSL code needs to be included in the props to make this more flexible (potentially the whole of
 * the `createRenderPipeline` object is that metadata?!)
*/
export function useGPURenderPipeline(props: Props): WebGpuPipeline | null {
  const { code, context } = props;

  return useMemo(() => {
    return context ? init(context) : null

    function init(context: WebGpuContext): WebGpuPipeline {
      const { device, format } = context

      const shaderModule = device.createShaderModule({ code })

      // create uniform buffer
      const uniformBuffer = device.createBuffer({
        size: 128,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });

      const bindGroupLayout = device.createBindGroupLayout({
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
            buffer: { type: 'uniform' },
          },
        ],
      });

      const bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [
          {
            binding: 0,
            resource: { buffer: uniformBuffer },
          },
        ],
      });

      const layout = device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout],
      });

      const pipeline = device.createRenderPipeline({
        vertex: {
          module: shaderModule,
          entryPoint: "vs_main",
        },
        fragment: {
          module: shaderModule,
          entryPoint: "fs_main",
          targets: [{ format }],
        },
        primitive: {
          topology: "triangle-strip",
        },
        layout,
      });

      return { bindGroup, uniformBuffer, pipeline }
    }
  }, [code, context])
}
