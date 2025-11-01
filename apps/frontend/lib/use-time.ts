"use client"

import { useEffect, useMemo, useRef, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";

type UseTimeOptions = {
  intervalMs?: number; // update cadence; default 1000ms
  startAt?: number | Date | Dayjs; // optional initial time; defaults to now
};

export type ReactiveTime = {
  now: Dayjs;
  unix: number; // seconds since epoch
  iso: string; // ISO string of now
  format: (template?: string) => string; // dayjs format helper
};

/**
 * React hook that exposes a reactive time value backed by dayjs.
 * It updates on a configurable interval (default: 1s).
 */
export function useTime(options: UseTimeOptions = {}): ReactiveTime {
  const { intervalMs = 1000, startAt } = options;
  const initialTs = useMemo(() => {
    if (startAt instanceof Date) return startAt.getTime();
    if (typeof startAt === "number") return startAt;
    if (startAt && typeof (startAt as Dayjs).valueOf === "function") return (startAt as Dayjs).valueOf();
    return Date.now();
  }, [startAt]);

  const [timestampMs, setTimestampMs] = useState<number>(initialTs);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // tick immediately to align with real current time if startAt was provided
    setTimestampMs(Date.now());

    // use window.setInterval for browser env; typings return number
    const id = window.setInterval(() => {
      setTimestampMs(Date.now());
    }, Math.max(16, intervalMs));
    intervalRef.current = id;
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [intervalMs]);

  const now = useMemo(() => dayjs(timestampMs), [timestampMs]);

  const api = useMemo<ReactiveTime>(() => {
    return {
      now,
      unix: Math.floor(now.valueOf() / 1000),
      iso: now.toISOString(),
      format: (template?: string) => (template ? now.format(template) : now.format()),
    };
  }, [now]);

  return api;
}


