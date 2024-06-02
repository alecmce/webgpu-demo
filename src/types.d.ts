declare namespace jest {
  interface Matchers {
    toBeCloseToArray: <T>(expected: T[], match: (a: T, b: T) => boolean) => object
  }

  interface Expect {
    toBeCloseToArray: <T>(expected: T[], match: (a: T, b: T) => boolean) => object
  }
}
