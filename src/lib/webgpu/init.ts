interface Props {
  start: VoidFunction
  fail:  (reason: string) => void
  warn:  (reason: string) => void
}

/** TODO: This was something I saw ... integrate? */
export async function initWebGpu(props: Props): Promise<void> {
  const { start, fail, warn } = props

  if (checkForGpu()) {
    const adapter = await requestAdapter()
    if (adapter) {
      const device = await requestDevice(adapter)
      attemptToRestartIfLost(device)
      start()
    }
  }

  function checkForGpu(): boolean {
    const hasGpu = !!navigator.gpu
    if (!hasGpu) {
      fail('This browser does not support WebGPU');
    }
    return hasGpu
  }

  async function requestAdapter(): Promise<GPUAdapter | null> {
    const adapter = await navigator.gpu.requestAdapter()
    if (!adapter) {
      fail('this browser supports webgpu but it appears disabled');
    }
    return adapter
  }

  async function requestDevice(adapter: GPUAdapter): Promise<GPUDevice> {
    return await adapter.requestDevice()
  }

  function attemptToRestartIfLost(device: GPUDevice): void {
    device.lost.then(attemptToRestart)

    function attemptToRestart(info: GPUDeviceLostInfo): void {
      warn(`WebGPU device was lost: ${info.message}`);
      if (info.reason !== 'destroyed') {
        start()
      }
    }
  }
}
