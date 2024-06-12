interface Props {
  blocks: CodeBlock[]
  id:     string
}

interface CodeBlock {
  id:            string;
  code:          string;
  dependencies?: string[];
}


/** Compiles a set of code blocks into a single string. */
export function compileCode(props: Props): string {
  const { blocks, id } = props

  const map = Object.fromEntries(blocks.map(block => [block.id, block]))
  const sorted = sortBlocks(blocks, map)
  const required = getRequired(id, map)

  return sorted.filter(isRequired).map(block => block.code).join("\n")

  function isRequired(block: CodeBlock): boolean {
    return required.has(block.id)
  }
}

/** Gets the set of required code blocks given a top-level block. */
function getRequired(id: string, map: Record<string, CodeBlock>): Set<string> {
  const requirements = new Set<string>()
  visit(id)
  return requirements

  function visit(id: string): void {
    const { dependencies } = map[id]
    if (!requirements.has(id)) {
      requirements.add(id)
      dependencies?.forEach(visit)
    }
  }
}

/** Topologically sorts blocks and detects any circularities. (TODO: Is this needed given https://github.com/gpuweb/gpuweb/wiki/WGSL-2021-11-02-Minutes#the-order-of-top-level-declarations-should-be-irrelevant-875 ?) */
function sortBlocks(blocks: CodeBlock[], map: Record<string, CodeBlock>): CodeBlock[] {
  const visited = new Set<string>();
  const sorted: CodeBlock[] = [];
  let pending = blocks;
  let isCircular = false;

  while (!isCircular && pending.length) {
    const [unconstrained, constrained] = splitArray(pending, isUnconstrained);
    isCircular = unconstrained.length === 0;
    sorted.push(...unconstrained);
    unconstrained.forEach(block => visited.add(block.id));
    pending = constrained;
  }

  if (isCircular) {
    throw new Error("Circular dependency detected")
  }

  return sorted

  function isUnconstrained(block: CodeBlock): boolean {
    const { dependencies } = map[block.id]
    return !dependencies || dependencies.every(id => visited.has(id))
  }
}

type SplitGroup<T> = [ingroup: T[], outgroup: T[]]

/** Splits an array into an ingroup and an outgroup based on the `inGroup` function. */
function splitArray<T>(array: T[], inGroup: (item: T) => boolean): SplitGroup<T> {
  const ingroup: T[] = []
  const outgroup: T[] = []

  array.forEach(visit)

  function visit(item: T): void {
    const group = inGroup(item) ? ingroup : outgroup
    group.push(item)
  }

  return [ingroup, outgroup]
}
