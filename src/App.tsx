import { ReactNode, useEffect, useState } from 'react'
import './App.css'
import { useWebGpuContext } from './lib/use-webgpu-context'
import { useWindowSize } from './lib/use-window-size'

import { useControls } from 'leva'
import { vec4 } from 'wgpu-matrix'
import { useDeboucedValue } from './world/debounce'
import { useOrbitControls } from './world/orbit-controls'
import { usePlayStop } from './world/play-stop'
import { Worms, WormsState, makeWorms } from './world/worms'


const INITIAL_STATE = {
  camera: { phi: 90, radius: 20, theta: 0 },
  light:  { phi: 120, radius: 25, theta: 340 },
}
const SENSITIVITY = 3
const SEED = vec4.create(Math.random(), Math.random(), Math.random(), Math.random())

/**
 * `makeWorms` is the entry point into the simulation.
*
 * TODO: `usePlayStop` wires up the space bar to start and stop the simulation. Just stop the compute, and allow the
 * render to continue!
 */
export function App(): ReactNode {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const [worms, setWorms] = useState<Worms | null>(null)

  const play = usePlayStop()
  const size = useWindowSize()

  const state = useControls({
    count:         { value: 20, min: 1, max: 50, step: 1 },
    fov:           { value: 80, min: 30, max: 120 },
    deltaRotation: { value: 0.5, min: 0, max: 1 },
    exaggeration:  { value: 10, min: 0, max: 25 },
    speed:         { value: 10, min: 0, max: 20 },
    gravity:       { value: 5, min: 0, max: 25 },
    smoothUnion:   { value: 1, min: 0.01, max: 5 },
  }) as WormsState


  const count = useDeboucedValue(state.count)
  const { camera, light } = useOrbitControls({ canvas, initialState: INITIAL_STATE, sensitivity: SENSITIVITY })
  const context = useWebGpuContext({ canvas })

  useEffect(() => {
    const parameters = { ...state, seed: SEED, camera, count, size, light }
    const worms = context ? makeWorms({ ...parameters, context }) : null
    setWorms(worms)

    return function unmount(): void {
      worms?.dispose()
    }
  }, [context, count])

  useEffect(() => {
    play ? worms?.play() : worms?.stop()
  }, [worms, play])

  useEffect(() => {
      worms?.update({ ...state, camera, light, seed: SEED, size })
  }, [camera, light, size, state])

  return (
    <>
      <canvas className="canvas" ref={setCanvas} width={size.width} height={size.height} />
      { worms ? <Info /> : <Fallback /> }
    </>
  )
}

function Info() {
  return (
    <div className="info">
      <p>
        This WebGPU simulation implements a ping-pong compute shader, and SDF raymarching and toon shading in the fragment
        shader. <a href="https://github.com/alecmce/webgpu-demo">Check out the code</a>.
      </p>
      <p>
        Drag to rotate the camera, wheel to zoom in and out. Shift-drag to rotate the light and shift-wheel to move the
        light in and out. Space starts and stops the simulation (currently also the render).
      </p>
    </div>
  )
}

function Fallback() {
  return (
    <div className="info">
      <p>Sorry, this demo only works in WebGPU enabled browsers.</p>
    </div>
  )
}
