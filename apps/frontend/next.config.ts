import type { NextConfig } from "next";
// @ts-ignore
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false, // Temporarily disabled for Docker builds
  turbopack: {}, // Empty turbopack config to silence webpack warning
  output: "standalone", // Enable standalone output for Docker
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
