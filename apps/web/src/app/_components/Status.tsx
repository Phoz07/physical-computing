
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useTime } from "@/lib/use-time";
import { useWeather } from "@/lib/use-weather";
import { getIconByWmo, getWmoIconAndLabel } from "@/lib/wmo-icons";
import { CurrencyIcon, Icon } from "lucide-react";

export default function Status() {
  const { format } = useTime({ intervalMs: 1000 });
  const {
    data,
    isLoading,
    isError,
    refetch,
    currentDescription,
    currentIcon: Icon,
  } = useWeather({
    latitude: 13.73,
    longitude: 100.75,
    timezone: "Asia/Bangkok",
    autoRefreshMs: 60_000,
  });

  return (
    <Card className="w-150 p-6 flex flex-col items-end">
      <Badge variant={"outline"} className="font-geist-mono uppercase">
        Client Information
      </Badge>
      <div className="flex-col items-end flex gap-2">
        <h2 className="uppercase font-bold text-5xl font-geist-mono">
          {format("HH:mm:ss")}
        </h2>
        <p className="uppercase font-geist-mono">
          {format("dddd DD MMMM YYYY")}
        </p>
      </div>
      <Badge variant={"outline"} className="font-geist-mono uppercase">
        Hardware Weather
      </Badge>
      <div className="flex-col items-end flex gap-2 font-geist-mono">
        <h2 className="flex items-center gap-4 font-bold text-4xl ">
          {Icon ? <Icon size={"1.2em"} /> : null}
          {currentDescription}
        </h2>
        <p className="">
          TEMP : {data?.current.temperature_2m}
          {data?.current_units.temperature_2m}
        </p>
        <Badge variant={"outline"}>
          Weather API Update At : {data?.current.time}
        </Badge>
      </div>
    </Card>
  );
}
