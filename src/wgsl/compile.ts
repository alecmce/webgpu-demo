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

  return getRequired(id, map).map(getCode).join("\n")

  function getCode(id: string): string {
    return map[id].code
  }
}

/** Gets the set of required code blocks given a top-level block. */
function getRequired(id: string, map: Record<string, CodeBlock>): string[] {
  const requirements = new Set<string>()
  visit(id)
  return Array.from(requirements)

  function visit(id: string): void {
    const { dependencies } = map[id]
    if (!requirements.has(id)) {
      requirements.add(id)
      dependencies?.forEach(visit)
    }
  }
}
