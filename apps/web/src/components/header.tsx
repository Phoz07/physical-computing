"use client";

import Image from "next/image";
import Link from "next/link";

import Logo from "@/../public/logo.svg";
import { ChevronsLeftRightEllipsis, Cpu } from "lucide-react";

export default function Header() {
  return (
    <div className="bg-white py-2 h-20 backdrop-blur sticky border-b border-border flex items-center justify-center">
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
            className="h-full"
          ></Image>
          <div className="hidden lg:flex flex-col justify-center">
            <span className="uppercase font-bold">Helmet Detection System</span>
            <span className="text-sm text-black">
              for Automatic Door Access
            </span>
          </div>
        </Link>
        <div className="flex gap-2 items-center font-geist-mono">
          <div className="border border-border flex gap-2 sm:gap-6 items-center rounded-full p-1 px-2">
            <span className="flex items-center gap-2">
              <ChevronsLeftRightEllipsis />
              <span className="hidden sm:block">AI status</span>
            </span>
            <span className="relative flex size-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex size-3 rounded-full bg-green-500"></span>
            </span>
          </div>
          <div className="border border-border flex gap-2 sm:gap-6 items-center rounded-full p-1 px-2">
            <span className="flex items-center gap-2">
              <Cpu />
              <span className="hidden sm:block">Hardware Connection</span>
            </span>
            <span className="relative flex size-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex size-3 rounded-full bg-green-500"></span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
