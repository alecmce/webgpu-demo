import { WebGpuContext } from '../lib/types'
import { makePingPongBuffers } from './ping-pong-buffers'
import { WormsComputeParameters, makeWormsCompute } from './worms-compute'
import { makeWormsInitialSimulationData } from './worms-initial-simulation-data'
import { WormsRenderParameters, makeWormsRender } from './worms-render'

export interface WormsState extends WormsComputeParameters, WormsRenderParameters {
  count: number
}

interface InitialParameters extends WormsState {
  context: WebGpuContext
  count:   number
}

export interface Worms {
  play:    VoidFunction
  stop:    VoidFunction
  update:  (state: WormsState) => void
  dispose: VoidFunction
}

export function makeWorms(initialParameters: InitialParameters): Worms {
  const { context, count } = initialParameters
  const { device } = context

  const initialSimulationData = makeWormsInitialSimulationData(count)

  const buffers = makePingPongBuffers({ context, initialSimulationData })

  const [compute, updateCompute] = makeWormsCompute({ buffers, context, count, initialParameters, initialSimulationData })
  const [render, updateRender] = makeWormsRender({ buffers, context, count, initialParameters, initialSimulationData })

  let time = -1
  let pingPong: 0 | 1 = 0
  let isPlaying = true
  let isDisposed = false

  return { play, stop, update, dispose }

  function play(): void {
    isPlaying = !isDisposed
    iterate()
  }

  function stop(): void {
    isPlaying = false
  }

  function iterate(): void {
    const now = Date.now()
    const deltaTime = time === -1 ? 0 : (now - time) / 1000
    time = now

    const encoder = device.createCommandEncoder();
    compute(encoder, pingPong, deltaTime)
    render(encoder, pingPong)
    device.queue.submit([encoder.finish()]);

    pingPong = (pingPong + 1) % 2

    if (isPlaying) {
      requestAnimationFrame(iterate)
    } else {
      time = -1
    }
  }

  function update(state: WormsState): void {
    updateRender(state)
    updateCompute(state)
  }

  function dispose(): void {
    isPlaying = false
    isDisposed = true
    buffers.forEach(buffer => buffer.destroy())
  }
}
