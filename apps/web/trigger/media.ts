import { task } from "@trigger.dev/sdk/v3";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";

const execFileAsync = promisify(execFile);

// Upload to Transloadit or return a placeholder URL for now.
// When real Transloadit keys are available, replace this with:
//   POST https://api2.transloadit.com/assemblies with auth + file buffer
async function uploadProcessedFile(filePath: string): Promise<string> {
  const fileName = path.basename(filePath);
  const fileBuffer = await fs.readFile(filePath);
  const base64 = fileBuffer.toString("base64");
  const ext = path.extname(filePath).replace(".", "") || "jpg";
  // Return as base64 data URI so downstream nodes (e.g. LLM) can consume it immediately
  return `data:image/${ext};base64,${base64}`;
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
  throw new Error("ffmpeg not found. Please install ffmpeg on the system.");
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
      // Download or decode the image
      if (imageUrl.startsWith("data:")) {
        const [, base64Data] = imageUrl.split(",");
        await fs.writeFile(inputPath, Buffer.from(base64Data, "base64"));
      } else {
        const res = await fetch(imageUrl);
        await fs.writeFile(inputPath, Buffer.from(await res.arrayBuffer()));
      }

      const ffmpeg = await findFfmpeg();

      // crop=w:h:x:y using percentage expressions
      const cropFilter = `crop=in_w*${widthPercent / 100}:in_h*${heightPercent / 100}:in_w*${xPercent / 100}:in_h*${yPercent / 100}`;

      await execFileAsync(ffmpeg, [
        "-y", "-i", inputPath,
        "-vf", cropFilter,
        "-frames:v", "1",
        outputPath,
      ]);

      const outputUrl = await uploadProcessedFile(outputPath);
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

      // Resolve timestamp — supports seconds (number) or "50%" style strings
      let seekArg: string;
      if (typeof payload.timestamp === "string" && payload.timestamp.endsWith("%")) {
        // We'll use a two-pass approach: first get duration, then seek
        const pct = parseFloat(payload.timestamp) / 100;
        const probeResult = await execFileAsync(ffmpeg, [
          "-i", videoUrl, "-f", "null", "-"
        ]).catch((e) => ({ stdout: "", stderr: e.stderr ?? "" }));
        const durationMatch = probeResult.stderr?.match(/Duration: (\d+):(\d+):([\d.]+)/);
        if (durationMatch) {
          const totalSeconds =
            parseInt(durationMatch[1]) * 3600 +
            parseInt(durationMatch[2]) * 60 +
            parseFloat(durationMatch[3]);
          seekArg = String(totalSeconds * pct);
        } else {
          seekArg = "0";
        }
      } else {
        seekArg = String(Number(payload.timestamp) || 0);
      }

      await execFileAsync(ffmpeg, [
        "-y", "-ss", seekArg, "-i", videoUrl,
        "-frames:v", "1", "-q:v", "2",
        outputPath,
      ]);

      const outputUrl = await uploadProcessedFile(outputPath);
      return { output: outputUrl };
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  },
});
