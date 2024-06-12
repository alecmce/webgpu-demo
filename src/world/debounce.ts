import { useEffect, useRef, useState } from "react"

const DEBOUNCE_TIME_MS = 500

/** Prevents values that require recompiling from updating per-frame! */
export function useDeboucedValue<T>(value: T): T {
  const [debounced, setDebounced] = useState(value)
  const id = useRef<number>(-1)

  useEffect(() => {
    clearTimeout(id.current)
    id.current = setTimeout(update, DEBOUNCE_TIME_MS)

    function update(): void {
      setDebounced(value)
    }
  }, [value])

  return debounced
}
