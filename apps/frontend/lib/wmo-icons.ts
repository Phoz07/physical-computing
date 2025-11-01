// Map WMO weather codes to lucide-react icon components
// Reference: https://codes.wmo.int/bufr4/codeflag/0-20-003

import type { LucideIcon } from "lucide-react";
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Tornado,
  Snowflake,
  CloudHail,
  CloudSunRain,
  CloudMoonRain,
  Cloudy,
} from "lucide-react";

// Groups of codes for easier mapping
const WMO: Record<string, readonly number[]> = {
  CLEAR: [0],
  MAINLY_CLEAR: [1],
  PARTLY_CLOUDY: [2],
  OVERCAST: [3],
  FOG: [45, 48],
  DRIZZLE: [51, 53, 55],
  FREEZING_DRIZZLE: [56, 57],
  RAIN: [61, 63, 65],
  FREEZING_RAIN: [66, 67],
  SNOW: [71, 73, 75],
  SNOW_GRAINS: [77],
  RAIN_SHOWERS: [80, 81, 82],
  SNOW_SHOWERS: [85, 86],
  THUNDERSTORM: [95],
  THUNDERSTORM_HAIL: [96, 99],
};

// Base icon choices for day vs night when applicable
type DayNightIconChoice = { day: LucideIcon; night: LucideIcon };
const dayNightIcons: Record<string, DayNightIconChoice> = {
  clear: { day: Sun, night: Moon },
  fewClouds: { day: CloudSun, night: CloudMoon },
  showers: { day: CloudSunRain, night: CloudMoonRain },
};

type IconLike = LucideIcon | DayNightIconChoice;

function mapEntry(code: number, icon: IconLike): readonly [number, IconLike] {
  return [code, icon] as const;
}

function isDayNightIconChoice(value: IconLike): value is DayNightIconChoice {
  return typeof value === "object" && value !== null && "day" in value && "night" in value;
}

// Mapping of individual codes to icon components (defaults applied if not specified)
const WMO_CODE_TO_ICON: Map<number, IconLike> = new Map([
  // Clear and cloud conditions
  ...WMO.CLEAR.map((c) => mapEntry(c, dayNightIcons.clear)),
  ...WMO.MAINLY_CLEAR.map((c) => mapEntry(c, dayNightIcons.fewClouds)),
  ...WMO.PARTLY_CLOUDY.map((c) => mapEntry(c, dayNightIcons.fewClouds)),
  ...WMO.OVERCAST.map((c) => mapEntry(c, Cloudy)),

  // Fog
  ...WMO.FOG.map((c) => mapEntry(c, CloudFog)),

  // Drizzle and rain
  ...WMO.DRIZZLE.map((c) => mapEntry(c, CloudDrizzle)),
  ...WMO.FREEZING_DRIZZLE.map((c) => mapEntry(c, CloudHail)),
  ...WMO.RAIN.map((c) => mapEntry(c, CloudRain)),
  ...WMO.FREEZING_RAIN.map((c) => mapEntry(c, CloudHail)),
  ...WMO.RAIN_SHOWERS.map((c) => mapEntry(c, dayNightIcons.showers)),

  // Snow
  ...WMO.SNOW.map((c) => mapEntry(c, CloudSnow)),
  ...WMO.SNOW_GRAINS.map((c) => mapEntry(c, Snowflake)),
  ...WMO.SNOW_SHOWERS.map((c) => mapEntry(c, CloudSnow)),

  // Thunderstorms
  ...WMO.THUNDERSTORM.map((c) => mapEntry(c, CloudLightning)),
  ...WMO.THUNDERSTORM_HAIL.map((c) => mapEntry(c, Tornado)), // closest strong-storm glyph
]);

export function getIconByWmo(
  wmoCode: number,
  opts: { isNight?: boolean; fallback?: LucideIcon } = {}
): LucideIcon {
  const { isNight = false, fallback = Cloud } = opts;
  const mapped = WMO_CODE_TO_ICON.get(Number(wmoCode));

  if (!mapped) return fallback;

  // Some entries specify separate day/night variants
  if (isDayNightIconChoice(mapped)) {
    return isNight ? mapped.night : mapped.day;
  }

  return mapped as LucideIcon;
}

export function getWmoAriaLabel(wmoCode: number): string {
  const code = Number(wmoCode);
  if (WMO.CLEAR.includes(code)) return "Clear sky";
  if (WMO.MAINLY_CLEAR.includes(code)) return "Mainly clear";
  if (WMO.PARTLY_CLOUDY.includes(code)) return "Partly cloudy";
  if (WMO.OVERCAST.includes(code)) return "Overcast";
  if (WMO.FOG.includes(code)) return "Fog";
  if (WMO.DRIZZLE.includes(code)) return "Drizzle";
  if (WMO.FREEZING_DRIZZLE.includes(code)) return "Freezing drizzle";
  if (WMO.RAIN.includes(code)) return "Rain";
  if (WMO.FREEZING_RAIN.includes(code)) return "Freezing rain";
  if (WMO.RAIN_SHOWERS.includes(code)) return "Rain showers";
  if (WMO.SNOW.includes(code)) return "Snow";
  if (WMO.SNOW_GRAINS.includes(code)) return "Snow grains";
  if (WMO.SNOW_SHOWERS.includes(code)) return "Snow showers";
  if (WMO.THUNDERSTORM.includes(code)) return "Thunderstorm";
  if (WMO.THUNDERSTORM_HAIL.includes(code)) return "Thunderstorm with hail";
  return "Unknown weather";
}

export function getWmoIconAndLabel(
  wmoCode: number,
  opts: { isNight?: boolean; fallback?: LucideIcon } = {}
): { Icon: LucideIcon; label: string } {
  return {
    Icon: getIconByWmo(wmoCode, opts),
    label: getWmoAriaLabel(wmoCode),
  };
}


