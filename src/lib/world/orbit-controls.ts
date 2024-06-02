import { useEffect, useRef, useState } from "react"
import { constrain } from "../math"
import { SphericalCoords } from "./spherical-coords"

interface Props {
  canvas:      HTMLCanvasElement | null
  initialState: Value
  sensitivity:  number
}

const CONSTRAINTS = {
  phi:    { min: 0.01, max: 179.99 },
  radius: { min: 1, max: 100 },
  theta:  { min: 0, max: 360, wrap: true },
}

interface Value {
  camera: SphericalCoords
  light:  SphericalCoords
}

interface State {
  down:    PointerEvent | null
  initial: Value
  current: Value
}

export function useOrbitControls(props: Props): Value {
  const { canvas, initialState, sensitivity } = props

  const shift = useRef<boolean>(false)
  const [state, setState] = useState<State>({ down: null, current: initialState, initial: initialState })

  useEffect(() => {
    canvas?.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return function unmount(): void {
      canvas?.removeEventListener('pointerdown', onPointerDown)
      canvas?.removeEventListener('pointermove', onPointerMove)
      canvas?.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }

    function onPointerDown(event: PointerEvent): void {
      setState(({ current }) => ({ down: event, initial: current, current }))

      canvas!.addEventListener('pointermove', onPointerMove)
      canvas!.addEventListener('pointerup', onPointerUp)
    }

    function onPointerMove(event: PointerEvent): void {
      setState(({ down, initial }) => {
        const dPhi = (event.clientY - down!.clientY) / sensitivity
        const dTheta = (down!.clientX - event.clientX) / sensitivity

        const target = shift.current ? initial.light : initial.camera
        const result = {
          theta: constrain(target.theta + dTheta, CONSTRAINTS.theta),
          phi: constrain(target.phi + dPhi, CONSTRAINTS.phi),
          radius: target.radius,
        }

        return shift.current
          ? { down, initial, current: { ...initial, light: result } }
          : { down, initial, current: { ...initial, camera: result } }
      })
    }

    function onPointerUp(): void {
      setState(({ current }) => ({ down: null, initial: current, current }))
      canvas!.removeEventListener('pointermove', onPointerMove)
      canvas!.removeEventListener('pointerup', onPointerUp)
    }

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Shift') {
        shift.current = true
      }
    }

    function onKeyUp(event: KeyboardEvent): void {
      if (event.key === 'Shift') {
        shift.current = false
      }
    }

    function onWheel(event: WheelEvent): void {
      event.stopImmediatePropagation()
      event.preventDefault()

      const dRadius = (event.deltaY) / sensitivity

      setState(({ down, initial, current }) => {
        const target = shift.current ? current.light : current.camera
        const radius = constrain(target.radius! + dRadius, CONSTRAINTS.radius)

        return shift.current
          ? { down, initial, current: { ...initial, light:  { ...target, radius } } }
          : { down, initial, current: { ...initial, camera:  { ...target, radius } } }
      })
    }
  }, [canvas, sensitivity])

  return state.current
}
