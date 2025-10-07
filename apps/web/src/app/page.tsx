"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useTime } from "@/lib/use-time";
import { useWeather } from "@/lib/use-weather";
import { getIconByWmo, getWmoIconAndLabel } from "@/lib/wmo-icons";
import { CurrencyIcon, Icon } from "lucide-react";
import Status from "./_components/Status";

import useWebSocket from "react-use-websocket";
import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessageHistory] = useState("");

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
    <div className="container p-4 mx-auto gap-4">
      <div className="flex gap-4">
        <Card className="w-full aspect-video">{message}
			<button onClick={() => {sendMessage("test")}}>send</button>
		</Card>
        <Status />
      </div>
    </div>
  );
}
