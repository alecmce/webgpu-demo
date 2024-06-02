import { Vec3, vec3 } from "wgpu-matrix";

export interface SphericalCoords {
  phi:     number // Azimuthal angle (longitude-like, in radians)
  theta:   number // Polar angle (latitude-like, in radians)
  radius?: number // Distance from origin
}

export function sphericalToCartesian(props: SphericalCoords): Vec3 {
  const { phi, theta, radius = 1 } = props

  const sinPhi = Math.sin(phi);
  const x = sinPhi * Math.sin(theta);
  const y = Math.cos(phi)
  const z = sinPhi * Math.cos(theta);

  return vec3.mulScalar(vec3.create(x, y, z), radius);
}
