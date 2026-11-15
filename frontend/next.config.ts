import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML in out/, served by FastAPI. Trailing slashes emit
  // route/index.html files that a plain static file server can resolve.
  output: "export",
  trailingSlash: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
