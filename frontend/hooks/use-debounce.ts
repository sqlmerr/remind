"use client";

import { useState, useEffect, useRef } from "react";

export function useDebounce<T>(value: T, delay = 500): [T, boolean] {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsDebouncing(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
      timerRef.current = null;
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay]);

  const flushDebounce = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      setDebouncedValue(value);
      setIsDebouncing(false);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isDebouncing) {
        flushDebounce();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDebouncing]);

  return [debouncedValue, isDebouncing];
}
