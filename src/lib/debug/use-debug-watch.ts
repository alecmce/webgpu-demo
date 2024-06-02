import { useEffect } from "react";
import { screenLog } from "./screen-log";
import './screen-log.css';

export function useDebugWatch<T>(log: string, value: T): void {
  useEffect(() => {
    screenLog(log)
  }, [value])
}
