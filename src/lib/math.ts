import { Constraint, OptionalConstraint, WrapConstraint } from "./types";

const DEG_TO_RAD = Math.PI / 180

export function degToRad(deg: number) {
  return deg * DEG_TO_RAD;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(Math.min(value, max), min)
}

export function dot(a: number[], b: number[]): number {
  return a.reduce(reducer, 0)

  function reducer(sum: number, value: number, index: number): number {
    return sum + value * b[index]
  }
}

export function normalize(value: number[]): number[] {
  const scalar = Math.hypot(...value)
  return scalar === 0 ? value : value.map(n => n / scalar)
}

export function length(value: number[]): number {
  return Math.hypot(...value)
}

export function constrain(value: number, constraint: Constraint): number {
  return isWrapConstriant(constraint)
    ? wrap(constraint)
    : weakClamp(constraint)

  function wrap(constraint: WrapConstraint): number {
    const { min, max } = constraint
    return positiveMod(value - min, max - min) + min
  }

  function weakClamp(constraint: OptionalConstraint): number {
    const { min = -Infinity, max = Infinity } = constraint
    return clamp(value, min, max)
    }

  function isWrapConstriant(constraint: Constraint): constraint is WrapConstraint {
    return (constraint as WrapConstraint).wrap
  }

  function positiveMod(a: number, mod: number): number {
    return (a % mod + mod) % mod
  }
}

export function step(limit: number, value: number): 0 | 1 {
  return value > limit ? 1 : 0;
}
