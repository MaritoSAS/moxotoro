import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/nfc",
        destination: "/tarjeta",
        permanent: false,
      },
    ];
  },
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
