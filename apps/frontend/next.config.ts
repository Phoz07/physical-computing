import type { NextConfig } from "next";
// @ts-ignore
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {}, // Empty turbopack config to silence webpack warning
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
