"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTime } from "@/lib/use-time";
import { useWeather } from "@/lib/use-weather";
import { getIconByWmo, getWmoIconAndLabel } from "@/lib/wmo-icons";
import { CurrencyIcon, DoorClosed, DoorOpen, Icon } from "lucide-react";
import Status from "./_components/Status";
import LogsTable from "./_components/LogsTable";
import CreateLogForm from "./_components/CreateLogForm";

import useWebSocket from "react-use-websocket";
import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [message, setMessageHistory] = useState("");
  const logsTableRef = useRef<{ refetch: () => void }>(null);

  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
    "ws://localhost:8787/steam",
    {
      onOpen: () => {
        console.log("open");
      },
      onMessage(event) {
        console.log(event.data);
      },
    }
  );

  useEffect(() => {
    console.log(lastMessage);

    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage.data + ""));
    }
  }, [lastMessage]);
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
    <div className="container p-4 mx-auto gap-4 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <Card className="h-80 aspect-video flex flex-col justify-between p-4">
          {/* <img src="" alt="" /> */}
          <div className="relative rounded-2xl overflow-hidden aspect-video">
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/MwNoqr1P0pc?si=p5_RemezvedNPnMl"
            ></iframe>
            <div className="absolute left-2 bottom-2 p-2 bg-background/40 backdrop-blur-sm rounded-full font-bold flex items-center">
              <button className="uppercase py-1 px-2 hover:bg-background/60 rounded-full flex gap-1 items-center">
                <DoorOpen />
                open
              </button>
              <button className="uppercase py-1 px-2 hover:bg-background/60 rounded-full flex gap-1 items-center">
                <DoorClosed />
                close
              </button>
            </div>
          </div>
        </Card>
        <div className="flex-1">
          <Status />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {/* <LogsTable key={Date.now()} /> */}
        </div>
        <div>
          <CreateLogForm onSuccess={() => window.location.reload()} />
        </div>
      </div>
    </div>
  );
}
