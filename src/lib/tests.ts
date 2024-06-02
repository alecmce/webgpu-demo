export interface TestResult {
  message: () => string
  pass:    boolean
}

export function toBeCloseToArray<T>(actual: T[], expected: T[], match: (a: T, b: T) => boolean): TestResult {
  const pass = actual.every((n, i) => match(n, expected[i]))

  return { message, pass }

  function message(): string {
    const mismatches = actual
      .map((a, i) => [match(a, expected[i]), a, expected[i], i])
      .filter(([pass]) => !pass)
      .map(([, a, b, i]) => `{ index: ${i}, actual: ${a}, expected: ${b} }`)
    return `Arrays did not match ${mismatches.join(', ')}`
  }
}

export function makeApproximateNumberTest(precision: number = 0.01): (a: number, b: number) => boolean {
  return function approximates(a: number, b: number): boolean {
    return a - precision < b && a + precision > b
  }
}
