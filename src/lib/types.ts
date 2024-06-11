export interface WindowSize {
  width: number
  height: number
}

export interface WebGpuContext {
  adapter: GPUAdapter
  context: GPUCanvasContext
  device:  GPUDevice
  format:  GPUTextureFormat
}

export const BYTES_PER_FLOAT = 4

export type Constraint = OptionalConstraint | WrapConstraint

export interface OptionalConstraint {
  min?: number
  max?: number
}

export interface WrapConstraint {
  min:  number
  max:  number
  wrap: true
}
