"use client";

import Image from "next/image";
import Link from "next/link";

import Logo from "@/../public/logo.svg";
import { ChevronsLeftRightEllipsis, Cpu } from "lucide-react";
import { useStatus } from "@/lib/use-status";

function StatusDot({ status }: { status: "ok" | "error" | "unknown" }) {
  const color =
    status === "ok"
      ? "bg-green-500"
      : status === "error"
      ? "bg-red-500"
      : "bg-gray-400";
  const ping =
    status === "ok"
      ? "bg-green-400"
      : status === "error"
      ? "bg-red-400"
      : "bg-gray-300";
  return (
    <span className="relative flex size-3" aria-hidden>
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full ${ping} opacity-75`}
      />
      <span className={`relative inline-flex size-3 rounded-full ${color}`} />
    </span>
  );
}

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
        <HeaderStatus />
      </div>
    </div>
  );
}

function HeaderStatus() {
  const { serverStatus, hardwareStatus, fetchCount, lastCheckedAt, isLoading } =
    useStatus(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      }/api/status`,
      10_000
    );
  return (
    <div className="flex gap-2 items-center font-geist-mono">
      <div className="border border-border flex gap-2 sm:gap-4 items-center rounded-full p-1 px-2">
        <span className="flex items-center gap-2">
          <ChevronsLeftRightEllipsis />
          <span className="hidden sm:block">Server</span>
        </span>
        <StatusDot status={serverStatus} />
        <div className="hidden sm:flex flex-col text-xs ml-2">
          <span className="font-medium">
            {isLoading ? "Checking..." : serverStatus.toUpperCase()}
          </span>
          <span className="text-muted-foreground">{fetchCount} checks</span>
        </div>
      </div>
      <div className="border border-border flex gap-2 sm:gap-4 items-center rounded-full p-1 px-2">
        <span className="flex items-center gap-2">
          <Cpu />
          <span className="hidden sm:block">Hardware</span>
        </span>
        <StatusDot status={hardwareStatus} />
        <div className="hidden sm:flex flex-col text-xs ml-2">
          <span className="font-medium">{hardwareStatus.toUpperCase()}</span>
          <span className="text-muted-foreground">
            {lastCheckedAt ? new Date(lastCheckedAt).toLocaleTimeString() : "-"}
          </span>
        </div>
      </div>
    </div>
  );
}
