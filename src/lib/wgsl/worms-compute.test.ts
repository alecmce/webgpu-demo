import { describe, expect, it } from "vitest";
import { clamp, dot, length, normalize } from "../math";
import { makeApproximateNumberTest, toBeCloseToArray } from "../tests";

expect.extend({ toBeCloseToArray })

const areClose = makeApproximateNumberTest(0.001)

describe('worms compute logic', () => {

  describe('resolveSpherical', () => {
    it('resolves [n,0] to up', () => {
      expect(resolveSpherical([0, 0])).toBeCloseToArray([0, 1, 0], areClose)
      expect(resolveSpherical([1, 0])).toBeCloseToArray([0, 1, 0], areClose)
      expect(resolveSpherical([2, 0])).toBeCloseToArray([0, 1, 0], areClose)
    })

    it('resolves [n, pi] to down', () => {
      expect(resolveSpherical([0, Math.PI])).toBeCloseToArray([0, -1, 0], areClose)
      expect(resolveSpherical([1, Math.PI])).toBeCloseToArray([0, -1, 0], areClose)
      expect(resolveSpherical([2, Math.PI])).toBeCloseToArray([0, -1, 0], areClose)
    })

    it('resolves [n, pi/2] to equatorial values', () => {
      const q = Math.PI / 2
      expect(resolveSpherical([0, q])).toBeCloseToArray([0, 0, 1], areClose)
      expect(resolveSpherical([q, q])).toBeCloseToArray([1, 0, 0], areClose)
      expect(resolveSpherical([2*q, q])).toBeCloseToArray([0, 0, -1], areClose)
      expect(resolveSpherical([3*q, q])).toBeCloseToArray([-1, 0, 0], areClose)
    })

    it('resolves values that differ cumulatively by pi/2 as at right-angles', () => {
      const a: [number, number] = [Math.random(), Math.random()]
      const b = Math.random()
      const c: [number, number] = [a[0] + b * Math.PI / 2, a[1] + (1 - b) * Math.PI / 2]
      expect(dot(resolveSpherical(a), resolveSpherical(c))).toBeCloseTo(1)
    })
  })

  describe('needsPerimeterChange', () => {
    it('returns a big value for vectors close to periemeter moving towards the perimeter', () => {
      expect(needsPerimeterChange([0, 9, 0], [0, 0])).toEqual(0.9)
    })

    it('returns a small value for vectors far from the periemeter moving towards the perimeter', () => {
      expect(needsPerimeterChange([0, 0, 0], [0, 0])).toEqual(0)
    })

    it('returns 0 for vectors close to the perimeter moving away from the perimeter', () => {
      expect(needsPerimeterChange([0, 9, 0], [0, Math.PI])).toEqual(0)
    })
  })
})

type vec2F32 = [number, number]
type vec3F32 = [number, number, number]
type f32 = number

const PERIMETER = 10

function needsPerimeterChange(currentPosition: vec3F32, currentDirection: vec2F32): f32 {
  const towardsPerimeter = clamp(dot(normalize(currentPosition), resolveSpherical(currentDirection)), 0.0, 1.0);
  const distanceFromPerimeter = clamp(length(currentPosition) / PERIMETER, 0.0, 1.0);
  return towardsPerimeter * distanceFromPerimeter;
}

function resolveSpherical(rotation: [number, number]): [number, number, number] {
  const theta = rotation[0];
  const phi = rotation[1];

  const sin_phi = Math.sin(phi);
  const x = sin_phi * Math.sin(theta);
  const y = Math.cos(phi);
  const z = sin_phi * Math.cos(theta);

  return [x, y, z]
}
