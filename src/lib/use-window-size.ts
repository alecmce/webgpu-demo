import { useEffect, useState } from 'react'
import { WindowSize } from './types'


export function useWindowSize(): WindowSize {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight })

  useEffect(() => {
    window.addEventListener('resize', onResize)

    function onResize(): void {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }

    return function dispose(): void {
      window.removeEventListener('resize', onResize)
    }
  })

  return size
}
