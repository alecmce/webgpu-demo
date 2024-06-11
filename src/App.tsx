import { ReactNode, useEffect, useMemo, useState } from 'react'
import './App.css'
import { useWebGpuContext } from './lib/use-webgpu-context'
import { useWindowSize } from './lib/use-window-size'

import { useControls } from 'leva'
import { vec4 } from 'wgpu-matrix'
import { useOrbitControls } from './lib/world/orbit-controls'
import { usePlayStop } from './lib/world/play-stop'
import { WormsState, makeWorms } from './lib/world/worms'


const INITIAL_STATE = {
  camera: { phi: 90, radius: 20, theta: 0 },
  light:  { phi: 120, radius: 25, theta: 340 },
}
const SENSITIVITY = 3
const SEED = vec4.create(Math.random(), Math.random(), Math.random(), Math.random())
const COUNT = 20

/**
 * TODO: `usePlayStop` wires up the space bar to start and stop the simulation. Just stop the compute, and allow the
 * render to continue!
 *
 * `makeWorms` is the entry point into the simulation.
 */
export function App(): ReactNode {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  const play = usePlayStop()
  const size = useWindowSize()

  const state = useControls({
    fov:           { value: 80, min: 30, max: 120 },
    deltaRotation: { value: 0.5, min: 0, max: 1 },
    exaggeration:  { value: 5, min: 0, max: 25 },
    speed:         { value: 10, min: 0, max: 20 },
    smoothUnion:   { value: 0.08, min: 0.01, max: 3 },
  }) as WormsState

  const { camera, light } = useOrbitControls({ canvas, initialState: INITIAL_STATE, sensitivity: SENSITIVITY })
  const context = useWebGpuContext({ canvas })
  const worms = useMemo(() => context ? makeWorms({ ...state, seed: SEED, camera, count: COUNT, context, size, light }) : undefined, [context])

  useEffect(() => {
    play ? worms?.play() : worms?.stop()
  }, [worms, play])

  useEffect(() => {
      worms?.update({ ...state, camera, light, seed: SEED, size })
  }, [camera, light, size, state])

  return (
    <>
      <canvas className="canvas" ref={setCanvas} width={size.width} height={size.height} />
      <div className="info">
        <p>
          Drag to rotate the camera, wheel to zoom in and out. Shift-drag to rotate the light and shift-wheel to move the
          light in and out. Space starts and stops the simulation (currently also the render).
        </p>
        <p>
          This simulation implements a ping-pong compute shader, and SDF raymarching in the fragment shader.
          <a href="https://github.com/alecmce/webgpu-demo">Check out the code</a>.
        </p>
      </div>
   </>
  )
}
