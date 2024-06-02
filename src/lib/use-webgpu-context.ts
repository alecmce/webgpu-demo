import { useEffect, useState } from "react";
import { WebGpuContext } from "./types";

interface Props {
  canvas: HTMLCanvasElement | null
  config?: Omit<GPUCanvasConfiguration, 'device' | 'format'>
}

const CONTEXT = 'webgpu'

/** Initializes a WebGpuContext with context, device and (preferred) format. */
export function useWebGpuContext(props: Props): WebGpuContext | null {
  const { canvas, config = {} } = props

  const [context, setContext] = useState<WebGpuContext | null>(null)

  useEffect(() => {
    if (canvas) {
      init(canvas)
    }

    async function init(canvas: HTMLCanvasElement): Promise<void> {
      const adapter = await navigator.gpu?.requestAdapter();
      const device = await adapter?.requestDevice();
      const context = canvas.getContext(CONTEXT)

      if (adapter && context && device) {
        const format = navigator.gpu.getPreferredCanvasFormat()
        // TODO: { alphaMode: 'premultiplied' } ?
        context.configure({ ...config, device, format })
        setContext({ adapter, context, device, format })
      }
    }
  }, [canvas])

  return context
}
