import { useEffect, useState } from "react";

export function usePlayStop(): boolean {
  const [play, setPlay] = useState(true)

  useEffect(() => {
    window.addEventListener('keypress', onKeyPress)

    return function unmount(): void {
      window.removeEventListener('keypress', onKeyPress)
    }

    function onKeyPress(event: KeyboardEvent): void {
      if (event.code === 'Space') {
        setPlay(play => !play)
      }
    }
  }, [setPlay])

  return play
}
