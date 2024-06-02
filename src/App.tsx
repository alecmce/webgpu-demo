import { mat4, vec3 } from 'gl-matrix'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import './App.css'
import { WebGpuContext, WebGpuPipeline, WindowSize } from './lib/types'
import { useWebGpuContext } from './lib/use-webgpu-context'
import { useGPURenderPipeline } from './lib/use-webgpu-render-pipeline'
import { useWindowSize } from './lib/use-window-size'

import code from './code.wgsl?raw'
import { degToRad } from './lib/math'

export function App(): ReactNode {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  const { width, height } = useWindowSize()

  const context = useWebGpuContext({ canvas })
  const pipeline = useGPURenderPipeline({ code, context })
  const render = useMemo(() => context && pipeline ? setupRender({ context, pipeline }) : null, [context, pipeline])

  useEffect(() => {
    let id = -1;

    if (render) {
      iterate()
    }

    function iterate(): void {
      render!({ width, height })
      id = requestAnimationFrame(iterate)
    }

    return function cancel(): void {
      cancelAnimationFrame(id)
    }
  }, [render, width, height])

  return (
    <>
     <canvas ref={setCanvas} width={width} height={height} />
    </>
  )
}

const FOV = 80
const CAMERA: vec3 = [0, 0, 0]
const CENTER: vec3 = [0, 0.5, -3]
const NEGATIVE_CENTER = CENTER.map(x => -x) as vec3
const UP: vec3 = [0, 1, 0]

interface Props {
  context:  WebGpuContext
  pipeline: WebGpuPipeline
}

function setupRender(props: Props): (size: WindowSize) => void {
  const { context: { context, device }, pipeline: { bindGroup, uniformBuffer, pipeline } } = props

  let frame = 0;

  return function render(size: WindowSize): void {
    const { width, height } = size

    const sceneViewMatrix = mat4.create();
    mat4.lookAt(sceneViewMatrix, CAMERA, CENTER, UP);
    mat4.translate(sceneViewMatrix, sceneViewMatrix, CENTER);
    mat4.rotateX(sceneViewMatrix, sceneViewMatrix, degToRad(frame / 13));
    mat4.rotateY(sceneViewMatrix, sceneViewMatrix, -degToRad(frame / 7));
    mat4.translate(sceneViewMatrix, sceneViewMatrix, NEGATIVE_CENTER);
    mat4.invert(sceneViewMatrix, sceneViewMatrix);

    const params = new Float32Array([...sceneViewMatrix, width, height, FOV, frame]);
    device.queue.writeBuffer(uniformBuffer, 0, params.buffer, params.byteOffset, params.byteLength);

    // render pass
    const commandEncoder = device.createCommandEncoder();
    const passEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 }, // transparent background
          loadOp: "clear",
          storeOp: "store",
          view: context.getCurrentTexture().createView(),
        },
      ],
    });

    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.draw(4, 1, 0, 0);
    passEncoder.end();
    device.queue.submit([commandEncoder.finish()]);

    // next frame
    frame ++
  }
}
