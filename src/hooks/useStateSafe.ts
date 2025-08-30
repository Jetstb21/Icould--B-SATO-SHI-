import { useState, useLayoutEffect } from "react";

// Safe state hook that works in SSR environments
export function useStateSafe<T>(initialValue: T): [T, (value: T) => void] {
  const [state, setState] = useState(initialValue);
  
  // Reset state when initial value changes
  useLayoutEffect(() => {
    setState(initialValue);
  }, [initialValue]);
  
  return [state, setState];
}