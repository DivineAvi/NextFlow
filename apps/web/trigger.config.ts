import { defineConfig } from "@trigger.dev/sdk/v3";
import { prismaExtension } from "@trigger.dev/build/extensions/prisma";
import { aptGet } from "@trigger.dev/build/extensions/core";

export default defineConfig({
  project: "proj_nextflow_demo",
  runtime: "node",
  logLevel: "log",
  maxDuration: 3600,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 2,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["./trigger"],
  build: {
    extensions: [
      prismaExtension({
        mode: "legacy",
        schema: "../../packages/core/prisma/schema.prisma",
      }),
      aptGet({ packages: ["ffmpeg"] }),
    ],
  },
});
