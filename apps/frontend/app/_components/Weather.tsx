"use client"

import { Badge } from "@/components/ui/badge";
import { useTime } from "@/lib/use-time";
import { useWeather } from "@/lib/use-weather";
import { Skeleton } from "@/components/ui/skeleton";

export default function Weather() {
  const { format } = useTime({ intervalMs: 1000 });
  const {
    data,
    isLoading,
    currentDescription,
    currentIcon: Icon,
  } = useWeather({
    latitude: 13.73,
    longitude: 100.75,
    timezone: "Asia/Bangkok",
    autoRefreshMs: 60_000,
  });

  return (
    <>
      <Badge variant={"outline"} className="font-mono uppercase">
        Client Information
      </Badge>
      <div className="flex-col items-start lg:items-end flex gap-2 w-full">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-40 md:w-56" />
            <Skeleton className="h-4 w-56 mt-1" />
          </>
        ) : (
          <>
            <h2 className="uppercase font-bold text-3xl md:text-5xl font-mono">
              {format("HH:mm:ss")}
            </h2>
            <p className="uppercase font-mono text-sm md:text-base">
              {format("dddd DD MMMM YYYY")}
            </p>
          </>
        )}
      </div>
      <Badge variant={"outline"} className="font-mono uppercase">
        Hardware Weather
      </Badge>
      <div className="flex-col items-start lg:items-end flex gap-2 font-mono w-full">
        {isLoading ? (
          <>
            <Skeleton className="h-6 w-40 md:w-56" />
            <Skeleton className="h-4 w-24 mt-1" />
            <Skeleton className="h-6 w-48 mt-2" />
          </>
        ) : (
          <>
            <h2 className="flex items-center gap-4 font-bold text-2xl md:text-4xl">
              {Icon ? <Icon size={"1.2em"} /> : null}
              {currentDescription}
            </h2>
            <p>
              TEMP : {data?.current.temperature_2m}
              {data?.current_units.temperature_2m}
            </p>
            <Badge variant={"outline"}>
              Weather API Update At : {data?.current.time}
            </Badge>
          </>
        )}
      </div>
    </>
  );
}
