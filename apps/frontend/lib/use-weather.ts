"use client"

import { useQuery } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";
import type { LucideIcon } from "lucide-react";
import { useMemo } from "react";
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
 * Async function to fetch weather data from Open-Meteo API.
 * API reference: https://api.open-meteo.com/
 */
async function fetchWeather(
  latitude: number,
  longitude: number,
  timezone: string
): Promise<WeatherResponse> {
  const url = "https://api.open-meteo.com/v1/forecast";
  const params = {
    latitude,
    longitude,
    current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
    hourly: "temperature_2m,relative_humidity_2m,precipitation_probability",
    daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone,
  };

  const response = await axios.get<WeatherResponse>(url, { params });
  return response.data;
}

/**
 * React hook to fetch weather data using React Query.
 * Supports automatic polling with configurable refresh interval.
 */
export function useWeather(options: UseWeatherOptions = {}): UseWeatherReturn {
  const {
    latitude = DEFAULT_LAT,
    longitude = DEFAULT_LON,
    timezone = DEFAULT_TZ,
    autoRefreshMs = null,
    isNight = false,
  } = options;

  const { data, error, isLoading, isError, isSuccess, refetch } = useQuery<
    WeatherResponse,
    AxiosError
  >({
    queryKey: ["weather", latitude, longitude, timezone],
    queryFn: () => fetchWeather(latitude, longitude, timezone),
    staleTime: 60 * 1000, // 60 seconds
    refetchInterval: autoRefreshMs && autoRefreshMs > 0 ? Math.max(5_000, autoRefreshMs) : false,
    retry: 2,
  });

  const status: UseWeatherStatus = isLoading
    ? "loading"
    : isError
      ? "error"
      : isSuccess
        ? "success"
        : "idle";

  const currentIcon = useMemo(() => {
    if (!data) return null;
    const { Icon } = getWmoIconAndLabel(data.current.weather_code, { isNight });
    return Icon;
  }, [data, isNight]);

  const currentIconLabel = useMemo(() => {
    if (!data) return null;
    const { label } = getWmoIconAndLabel(data.current.weather_code, { isNight });
    return label;
  }, [data, isNight]);

  const currentDescription = useMemo(() => {
    if (!data) return null;
    return getWmoAriaLabel(data.current.weather_code);
  }, [data]);

  return {
    data: data ?? null,
    error: error ?? null,
    status,
    isLoading,
    isError,
    isSuccess,
    refetch: async () => {
      await refetch();
    },
    currentIcon,
    currentIconLabel,
    currentDescription,
  };
}


