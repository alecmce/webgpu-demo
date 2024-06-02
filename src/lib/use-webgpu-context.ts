import { useEffect, useState } from "react";
import { WebGpuContext } from "./types";

interface Props {
  canvas: HTMLCanvasElement | null
  config?: Omit<GPUCanvasConfiguration, 'device' | 'format'>
}

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
      const context = canvas.getContext("webgpu")

      if (context && device) {
        const format = navigator.gpu.getPreferredCanvasFormat()
        context.configure({ ...config, device, format })
        setContext({ context, device, format })
      }
    }
  }, [canvas])

  return context
}
