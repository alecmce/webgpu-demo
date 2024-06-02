export interface WindowSize {
  width: number
  height: number
}

export interface WebGpuContext {
  context: GPUCanvasContext
  device:  GPUDevice
  format:  GPUTextureFormat
}

export interface WebGpuPipeline {
  bindGroup:     GPUBindGroup
  uniformBuffer: GPUBuffer
  pipeline:      GPURenderPipeline
}
