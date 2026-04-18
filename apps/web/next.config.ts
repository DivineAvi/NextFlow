import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Disable Strict Mode in development to prevent double-mounting of
     ReactFlow stores (which triggers the #002 nodeTypes warning).
     This also halves the component mount overhead in dev. */
  reactStrictMode: false,
};

export default nextConfig;
