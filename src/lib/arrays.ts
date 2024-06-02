export function repeat<T>(list: T[], count: number): T[] {
  return (Array(count) as T[][]).fill(list).flat()
}
