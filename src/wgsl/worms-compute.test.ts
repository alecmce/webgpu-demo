import { describe, expect, it } from "vitest";
import { clamp, dot, length, normalize, step } from "../lib/math";
import { makeApproximateNumberTest, toBeCloseToArray } from "../lib/tests";

expect.extend({ toBeCloseToArray })

const areClose = makeApproximateNumberTest(0.001)

describe('worms compute logic', () => {

  describe('spherical_to_cartesian', () => {
    it('resolves [n,0] to up', () => {
      expect(spherical_to_cartesian([0, 0])).toBeCloseToArray([0, 1, 0], areClose)
      expect(spherical_to_cartesian([1, 0])).toBeCloseToArray([0, 1, 0], areClose)
      expect(spherical_to_cartesian([2, 0])).toBeCloseToArray([0, 1, 0], areClose)
    })

    it('resolves [n, pi] to down', () => {
      expect(spherical_to_cartesian([0, Math.PI])).toBeCloseToArray([0, -1, 0], areClose)
      expect(spherical_to_cartesian([1, Math.PI])).toBeCloseToArray([0, -1, 0], areClose)
      expect(spherical_to_cartesian([2, Math.PI])).toBeCloseToArray([0, -1, 0], areClose)
    })

    it('resolves [n, pi/2] to equatorial values', () => {
      const q = Math.PI / 2
      expect(spherical_to_cartesian([0, q])).toBeCloseToArray([0, 0, 1], areClose)
      expect(spherical_to_cartesian([q, q])).toBeCloseToArray([1, 0, 0], areClose)
      expect(spherical_to_cartesian([2*q, q])).toBeCloseToArray([0, 0, -1], areClose)
      expect(spherical_to_cartesian([3*q, q])).toBeCloseToArray([-1, 0, 0], areClose)
    })
  })

  describe('cartesian_to_spherical', () => {
    function roundTrip(value: vec2_f32): vec2_f32 {
      return cartesian_to_spherical(spherical_to_cartesian(value))
    }

    it('roundtrips spherical_to_cartesian', () => {
      expect(roundTrip([1, 2])).toBeCloseToArray([1, 2], areClose)
      expect(roundTrip([0, 2])).toBeCloseToArray([0, 2], areClose)
      expect(roundTrip([-1, 2])).toBeCloseToArray([-1, 2], areClose)

      console.log(spherical_to_cartesian([1, -1]))
      console.log(spherical_to_cartesian([1, 1]))
      console.log(spherical_to_cartesian([-1, 1]))
      console.log(spherical_to_cartesian([-1, -1]))
      console.log(spherical_to_cartesian([0.1, -1]))
      console.log(spherical_to_cartesian([0.1, 1]))
      console.log(spherical_to_cartesian([-0.1, 1]))
      console.log(spherical_to_cartesian([-0.1, -1]))

      expect(roundTrip([1, -1])).toBeCloseToArray([1, -1], areClose)
      expect(roundTrip([0, 0])).toBeCloseToArray([1, 0], areClose)
    })
  })

  describe('needs_perimeter_change', () => {
    it('returns a big value for vectors close to periemeter moving towards the perimeter', () => {
      expect(needs_perimeter_change([0, 9, 0], [0, 0])).toBeGreaterThan(0.5)
    })

    it('returns a small value for vectors far from the periemeter moving towards the perimeter', () => {
      expect(needs_perimeter_change([0, 0, 0], [0, 0])).toEqual(0)
    })

    it('returns 0 for vectors close to the perimeter moving away from the perimeter', () => {
      expect(needs_perimeter_change([0, 9, 0], [0, Math.PI])).toEqual(0)
    })
  })
})

type vec2_f32 = [number, number]
type vec3_f32 = [number, number, number]
type f32 = number

const PERIMETER = 10

function needs_perimeter_change(current_position: vec3_f32, current_direction: vec2_f32): f32 {
  const parallelness = dot(normalize(current_position), spherical_to_cartesian(current_direction));
  const towards_perimeter = step(0.0, parallelness);
  const distance_from_perimeter = cubic_in(clamp(length(current_position) / PERIMETER, 0.0, 1.0));
  return towards_perimeter * distance_from_perimeter;
}

function cubic_in(p: f32): f32 {
  return p * p * p;
}

function spherical_to_cartesian(rotation: vec2_f32): vec3_f32 {
  const theta = rotation[0];
  const phi = rotation[1];
  const sin_phi = Math.sin(phi);
  return [sin_phi * Math.sin(theta), Math.cos(phi), sin_phi * Math.cos(theta)]
}

function cartesian_to_spherical(cartesian: vec3_f32): vec2_f32 {
  const normalized = normalize(cartesian)
  const alpha = Math.atan2(normalized[0], normalized[2]);
  const theta = normalized[2] < 0 ? alpha + Math.PI : alpha
  const phi = Math.acos(normalized[1]) * Math.sign(normalized[2])
  return [theta, phi];
}
