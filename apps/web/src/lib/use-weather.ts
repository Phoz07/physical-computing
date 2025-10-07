import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios, { type AxiosError } from "axios";
import type { LucideIcon } from "lucide-react";
import { getWmoIconAndLabel, getWmoAriaLabel } from "@/lib/wmo-icons";

// === Types for Open-Meteo response ===

export interface CurrentUnits {
  time: "iso8601";
  interval: "seconds" | number;
  temperature_2m: string; // unit label, e.g. "°C"
  relative_humidity_2m: string; // "%"
  weather_code: string; // "wmo code"
  wind_speed_10m: string; // e.g. "km/h"
}

export interface CurrentData {
  time: string; // ISO8601
  interval: number; // seconds
  temperature_2m: number;
  relative_humidity_2m: number;
  weather_code: number; // WMO code
  wind_speed_10m: number;
}

export interface HourlyUnits {
  time: "iso8601";
  temperature_2m: string; // unit label
  relative_humidity_2m: string; // unit label
  precipitation_probability: string; // unit label
}

export interface HourlyData {
  time: string[]; // ISO per hour
  temperature_2m: number[];
  relative_humidity_2m: number[];
  precipitation_probability: number[]; // %
}

export interface DailyUnits {
  time: "iso8601";
  temperature_2m_max: string; // unit label
  temperature_2m_min: string; // unit label
  precipitation_probability_max: string; // unit label
}

export interface DailyData {
  time: string[]; // YYYY-MM-DD
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: number[];
}

export interface WeatherResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string; // e.g. "Asia/Bangkok"
  timezone_abbreviation: string; // e.g. "GMT+7"
  elevation: number;
  current_units: CurrentUnits;
  current: CurrentData;
  hourly_units: HourlyUnits;
  hourly: HourlyData;
  daily_units: DailyUnits;
  daily: DailyData;
}

export type UseWeatherStatus = "idle" | "loading" | "success" | "error";

export interface UseWeatherOptions {
  latitude?: number; // default 13.73
  longitude?: number; // default 100.75
  timezone?: string; // default "Asia/Bangkok"
  autoRefreshMs?: number | null; // set to a number to enable polling; null/undefined disables
  isNight?: boolean; // hint for icon selection
}

export interface UseWeatherReturn {
  data: WeatherResponse | null;
  error: AxiosError | null;
  status: UseWeatherStatus;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  refetch: () => Promise<void>;
  currentIcon: LucideIcon | null;
  currentIconLabel: string | null;
  currentDescription: string | null;
}

const DEFAULT_LAT = 13.73;
const DEFAULT_LON = 100.75;
const DEFAULT_TZ = "Asia/Bangkok";

/**
 * React hook to fetch weather data from Open-Meteo using axios.
 * API reference: https://api.open-meteo.com/
 */
export function useWeather(options: UseWeatherOptions = {}): UseWeatherReturn {
  const {
    latitude = DEFAULT_LAT,
    longitude = DEFAULT_LON,
    timezone = DEFAULT_TZ,
    autoRefreshMs = null,
    isNight = false,
  } = options;

  const [data, setData] = useState<WeatherResponse | null>(null);
  const [error, setError] = useState<AxiosError | null>(null);
  const [status, setStatus] = useState<UseWeatherStatus>("idle");
  const timerRef = useRef<number | null>(null);

  const url = useMemo(() => {
    return "https://api.open-meteo.com/v1/forecast";
  }, []);

  const params = useMemo(() => {
    return {
      latitude,
      longitude,
      current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
      hourly: "temperature_2m,relative_humidity_2m,precipitation_probability",
      daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max",
      timezone,
    } as const;
  }, [latitude, longitude, timezone]);

  const refetch = useCallback(async () => {
    setStatus((s) => (s === "success" ? "loading" : "loading"));
    setError(null);
    try {
      const res = await axios.get<WeatherResponse>(url, { params });
      setData(res.data);
      setStatus("success");
    } catch (err) {
      setError(err as AxiosError);
      setStatus("error");
    }
  }, [url, params]);

  useEffect(() => {
    // initial load
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (autoRefreshMs == null || autoRefreshMs <= 0) {
      return;
    }
    const id = window.setInterval(() => {
      refetch();
    }, Math.max(5_000, autoRefreshMs));
    timerRef.current = id;
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [autoRefreshMs, refetch]);

  return {
    data,
    error,
    status,
    isLoading: status === "loading",
    isError: status === "error",
    isSuccess: status === "success",
    refetch,
    currentIcon: useMemo(() => {
      if (!data) return null;
      const { Icon } = getWmoIconAndLabel(data.current.weather_code, { isNight });
      return Icon;
    }, [data, isNight]),
    currentIconLabel: useMemo(() => {
      if (!data) return null;
      const { label } = getWmoIconAndLabel(data.current.weather_code, { isNight });
      return label;
    }, [data, isNight]),
    currentDescription: useMemo(() => {
      if (!data) return null;
      return getWmoAriaLabel(data.current.weather_code);
    }, [data]),
  };
}


