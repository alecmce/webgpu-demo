import bezier from './bezier-sdf.wgsl?raw'
import color from './color.wgsl?raw'
import { compileCode } from './compile'
import wormsRender from './worms-render.wgsl?raw'
import random from './random.wgsl?raw'
import raymarching from './raymarching.wgsl?raw'
import screen from './screen.wgsl?raw'
import sdf from './sdf.wgsl?raw'
import toon from './toon-shading.wgsl?raw'
import wormsTypes from './worms-types.wgsl?raw'
import wormsCompute from './worms-compute.wgsl?raw'

export const CODE_BLOCKS = [
  { id: 'bezier-sdf', code: bezier, dependencies: [] },
  { id: 'color', code: color, dependencies: [] },
  { id: 'worms-render', code: wormsRender, dependencies: ['ray-marching', 'screen', 'sdf', 'toon', 'worms-types'] },
  { id: 'random', code: random, dependencies: [] },
  { id: 'ray-marching', code: raymarching, dependencies: [] },
  { id: 'screen', code: screen, dependencies: [] },
  { id: 'sdf', code: sdf, dependencies: ['bezier-sdf'] },
  { id: 'toon', code: toon, dependencies: ['color'] },
  { id: 'worms-types', code: wormsTypes, dependencies: [] },
  { id: 'worms-compute', code: wormsCompute, dependencies: ['random', 'worms-types'] },
];

export function getCode(id: string, replacements: Record<string, string> = {}): string {
  const entries = Object.entries(replacements)
  return entries.reduce(replace, compileCode({ blocks: CODE_BLOCKS, id }))

  function replace(code: string, [input, output]: [string, string]): string {
    return code.replace(input, output)
  }
}
