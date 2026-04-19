import { task } from "@trigger.dev/sdk/v3";
import { Transloadit } from "transloadit";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";

const execFileAsync = promisify(execFile);

async function uploadToTransloadit(filePath: string): Promise<string> {
  const authKey = process.env.TRANSLOADIT_KEY;
  const authSecret = process.env.TRANSLOADIT_SECRET;

  if (!authKey || !authSecret) {
    throw new Error("Transloadit credentials missing (TRANSLOADIT_KEY / TRANSLOADIT_SECRET)");
  }

  const transloadit = new Transloadit({ authKey, authSecret });

  const assembly = await transloadit.createAssembly({
    files: { file: filePath },
    params: { steps: {} },
    waitForCompletion: true,
  });

  const upload = (assembly as any).uploads?.[0];
  const url: string | undefined = upload?.ssl_url || upload?.url;

  if (!url) {
    throw new Error("Transloadit returned no URL after upload");
  }

  return url;
}

async function findFfmpeg(): Promise<string> {
  for (const candidate of ["/usr/bin/ffmpeg", "/usr/local/bin/ffmpeg", "ffmpeg"]) {
    try {
      await execFileAsync(candidate, ["-version"]);
      return candidate;
    } catch {
      // not found here, try next
    }
  }
  throw new Error("ffmpeg not found on this system. Install it or configure the path.");
}

export const cropImageTask = task({
  id: "crop-image-task",
  maxDuration: 300,
  run: async (payload: {
    imageUrl: string;
    xPercent: number;
    yPercent: number;
    widthPercent: number;
    heightPercent: number;
  }) => {
    const { imageUrl, xPercent, yPercent, widthPercent, heightPercent } = payload;

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "nextflow-crop-"));
    const inputPath = path.join(tmpDir, "input.jpg");
    const outputPath = path.join(tmpDir, "output.jpg");

    try {
      // Download source image (supports both URLs and base64 data URIs)
      if (imageUrl.startsWith("data:")) {
        const [, base64Data] = imageUrl.split(",");
        await fs.writeFile(inputPath, Buffer.from(base64Data, "base64"));
      } else {
        const res = await fetch(imageUrl);
        if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
        await fs.writeFile(inputPath, Buffer.from(await res.arrayBuffer()));
      }

      const ffmpeg = await findFfmpeg();

      // Percentage-based crop filter: crop=w:h:x:y
      const safeX = Math.max(0, Math.min(100, xPercent));
      const safeY = Math.max(0, Math.min(100, yPercent));
      const safeW = Math.max(1, Math.min(100, widthPercent));
      const safeH = Math.max(1, Math.min(100, heightPercent));
      const cropFilter = `crop=in_w*${safeW / 100}:in_h*${safeH / 100}:in_w*${safeX / 100}:in_h*${safeY / 100}`;

      await execFileAsync(ffmpeg, [
        "-y",
        "-i", inputPath,
        "-vf", cropFilter,
        "-frames:v", "1",
        outputPath,
      ]);

      const outputUrl = await uploadToTransloadit(outputPath);
      return { output: outputUrl };
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  },
});

export const extractFrameTask = task({
  id: "extract-frame-task",
  maxDuration: 300,
  run: async (payload: {
    videoUrl: string;
    timestamp: number | string;
  }) => {
    const { videoUrl } = payload;

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "nextflow-frame-"));
    const outputPath = path.join(tmpDir, "frame.jpg");

    try {
      const ffmpeg = await findFfmpeg();

      let seekArg: string;

      if (
        typeof payload.timestamp === "string" &&
        payload.timestamp.trim().endsWith("%")
      ) {
        const pct = parseFloat(payload.timestamp) / 100;
        // Probe duration via stderr
        const probeResult = await execFileAsync(ffmpeg, [
          "-i", videoUrl,
          "-f", "null", "-",
        ]).catch((e) => ({ stdout: "", stderr: (e as any).stderr ?? "" }));

        const match = (probeResult as any).stderr?.match(
          /Duration:\s*(\d+):(\d+):([\d.]+)/
        );
        if (match) {
          const totalSec =
            parseInt(match[1]) * 3600 +
            parseInt(match[2]) * 60 +
            parseFloat(match[3]);
          seekArg = String(Math.max(0, totalSec * pct));
        } else {
          seekArg = "0";
        }
      } else {
        seekArg = String(Number(payload.timestamp) || 0);
      }

      await execFileAsync(ffmpeg, [
        "-y",
        "-ss", seekArg,
        "-i", videoUrl,
        "-frames:v", "1",
        "-q:v", "2",
        outputPath,
      ]);

      const outputUrl = await uploadToTransloadit(outputPath);
      return { output: outputUrl };
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  },
});
