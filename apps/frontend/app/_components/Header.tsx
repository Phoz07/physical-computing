"use client";

import Image from "next/image";
import Link from "next/link";

import Logo from "@/public/logo.svg";
import { ChevronsLeftRightEllipsis, Cpu } from "lucide-react";
import Status, { EnumStatus } from "./Status";
import SettingsSheet from "./SettingsSheet";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

export default function Header() {
  return (
    <div className="bg-background py-2 h-16 md:h-20 backdrop-blur sticky border-b border-border flex items-center justify-center">
      <div className="container flex items-center justify-between px-4">
        <Link
          href={"/"}
          className="flex items-center gap-2 h-full w-fit hover:text-primary"
        >
          <Image
            src={Logo}
            quality={100}
            priority
            alt="Logo"
            className="h-8 md:h-full"
          ></Image>
          <div className="hidden lg:flex flex-col justify-center">
            <span className="uppercase font-bold">Helmet Detection System</span>
            <span className="text-sm text-foreground">
              for Automatic Door Access
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <HeaderStatus />
          <SettingsSheet />
        </div>
      </div>
    </div>
  );
}

dayjs.extend(relativeTime);

interface ServerStatusResponse {
  isOnline: boolean;
  timestamp?: string;
  uptime?: number;
}

interface HardwareStatusResponse {
  isOnline: boolean;
  timestamp?: string;
  temperature?: number;
}

function HeaderStatus() {
  const {
    data: serverData,
    isError: serverError,
    isLoading: serverLoading,
  } = useQuery<ServerStatusResponse>({
    queryKey: ["serverStatus"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/status`
      );
      return res.data;
    },
    refetchInterval: 5000, // Refetch every 5 seconds
    retry: 1,
  });

  const {
    data: hardwareData,
    isError: hardwareError,
    isLoading: hardwareLoading,
  } = useQuery<HardwareStatusResponse>({
    queryKey: ["hardwareStatus"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/hardware/status`
      );
      return res.data;
    },
    refetchInterval: 5000, // Refetch every 5 seconds
    retry: 1,
  });

  const getServerStatus = (): EnumStatus => {
    if (serverLoading) return EnumStatus.IDLE;
    if (serverError || !serverData) return EnumStatus.ERROR;
    return serverData.isOnline ? EnumStatus.SUCCESS : EnumStatus.ERROR;
  };

  const getHardwareStatus = (): EnumStatus => {
    if (hardwareLoading) return EnumStatus.IDLE;
    if (hardwareError || !hardwareData) return EnumStatus.ERROR;
    return hardwareData.isOnline ? EnumStatus.SUCCESS : EnumStatus.ERROR;
  };

  return (
    <TooltipProvider>
      <div className="flex gap-2 items-center font-mono">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="border border-border flex gap-2 sm:gap-4 items-center rounded-full p-1 px-2 cursor-help">
              <span className="flex items-center gap-2">
                <ChevronsLeftRightEllipsis />
                <span className="hidden sm:block">Server</span>
              </span>
              <Status status={getServerStatus()} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {serverLoading
                ? "Checking server status..."
                : serverError || !serverData
                ? "Server offline"
                : serverData.isOnline
                ? serverData.timestamp
                  ? `Last heartbeat: ${dayjs(serverData.timestamp).fromNow()}`
                  : "Server is online"
                : "Server is offline"}
            </p>
            {serverData?.timestamp && (
              <p className="text-xs text-muted-foreground mt-1">
                {dayjs(serverData.timestamp).format("MMM D, YYYY HH:mm:ss")}
              </p>
            )}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="border border-border flex gap-2 sm:gap-4 items-center rounded-full p-1 px-2 cursor-help">
              <span className="flex items-center gap-2">
                <Cpu />
                <span className="hidden sm:block">Hardware</span>
              </span>
              <Status status={getHardwareStatus()} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {hardwareLoading
                ? "Checking hardware status..."
                : hardwareError || !hardwareData
                ? "Hardware offline"
                : hardwareData.isOnline
                ? hardwareData.timestamp
                  ? `Last heartbeat: ${dayjs(hardwareData.timestamp).fromNow()}`
                  : "Hardware is online"
                : "Hardware is offline"}
            </p>
            {hardwareData?.timestamp && (
              <p className="text-xs text-muted-foreground mt-1">
                {dayjs(hardwareData.timestamp).format("MMM D, YYYY HH:mm:ss")}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
