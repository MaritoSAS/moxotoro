import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.geojson": {
        loaders: ["./geojson-loader.cjs"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
