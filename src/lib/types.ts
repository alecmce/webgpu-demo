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

export interface WebGpuPipeline {
  group:    BindingGroup
  pipeline: GPURenderPipeline
}

export const BYTES_PER_FLOAT = 4

export interface BindingGroupBuilder {
  addUniform: (id: string, metadata: UniformMetadata) => BindingGroupBuilder
  build:      () => BindingGroup
}

export interface UniformMetadata {
  size:       number
  usage:      GPUBufferUsageFlags
  visibility: GPUShaderStageFlags
}

export interface BindingGroup {
  getBuffer: (id: string) => GPUBuffer | undefined
  layout:    GPUBindGroupLayout
  group:     GPUBindGroup
}

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
