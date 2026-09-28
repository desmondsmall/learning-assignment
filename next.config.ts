import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The prompts are Markdown read from disk at runtime, so they're traced into the route explicitly.
  outputFileTracingIncludes: {
    "/api/feedback": ["./prompts/**/*"],
    "/api/closing": ["./prompts/**/*"],
  },
};

export default nextConfig;
