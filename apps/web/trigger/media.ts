import { task } from "@trigger.dev/sdk/v3";
import { Transloadit } from "transloadit";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";

const execFileAsync = promisify(execFile);

const TEMPLATE_IDS: Record<string, string> = {
  image: "3005d2c37bd846cab3a08730c220d82a",
  video: "153c6292cef84f1a899c689cde4179b1",
};

function getTransloadit() {
  const authKey = process.env.TRANSLOADIT_KEY;
  const authSecret = process.env.TRANSLOADIT_SECRET;
  if (!authKey || !authSecret) {
    throw new Error("Transloadit credentials missing (TRANSLOADIT_KEY / TRANSLOADIT_SECRET)");
  }
  return new Transloadit({ authKey, authSecret });
}

function extractUrl(assembly: unknown): string {
  const a = assembly as any;
  // Results from a processing step (template or explicit robot)
  const firstStep = a.results && (Object.values(a.results)[0] as any[]);
  const resultFile = firstStep?.[0];
  // Raw uploads fallback
  const uploadFile = a.uploads?.[0];
  const url =
    resultFile?.ssl_url ?? resultFile?.url ?? uploadFile?.ssl_url ?? uploadFile?.url;
  if (!url) throw new Error("Transloadit returned no URL after upload");
  return url as string;
}

// Used by cropImageTask and extractFrameTask to store processed output files.
async function uploadToTransloadit(filePath: string): Promise<string> {
  const transloadit = getTransloadit();
  const assembly = await transloadit.createAssembly({
    files: { file: filePath },
    params: {
      steps: {
        ":original": { robot: "/upload/handle" },
      },
    },
    waitForCompletion: true,
  });
  return extractUrl(assembly);
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
  throw new Error("ffmpeg not found on this system");
}

// Receives a base64 data URL from the frontend node, uploads it to Transloadit
// inside the Trigger.dev execution context, and returns a persistent CDN URL.
export const uploadFileTask = task({
  id: "upload-file-task",
  maxDuration: 120,
  run: async ({ dataUrl }: { dataUrl: string }): Promise<{ output: string }> => {
    if (!dataUrl) throw new Error("No file selected — add a file to the node before running");

    // Already a remote CDN URL (saved workflow) — pass through.
    if (!dataUrl.startsWith("data:")) {
      return { output: dataUrl };
    }

    const commaIdx = dataUrl.indexOf(",");
    if (commaIdx === -1) throw new Error("Invalid data URL format");

    const header = dataUrl.slice(0, commaIdx);
    const base64Data = dataUrl.slice(commaIdx + 1);
    const mimeType = header.match(/data:([^;]+)/)?.[1] ?? "application/octet-stream";
    const ext = mimeType.split("/")[1]?.split("+")[0] ?? "bin";

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "nextflow-upload-"));
    const tmpPath = path.join(tmpDir, `file.${ext}`);

    try {
      await fs.writeFile(tmpPath, Buffer.from(base64Data, "base64"));

      const transloadit = getTransloadit();
      // Use /upload/handle for all types — avoids template-specific GCS buckets
      // that may not be publicly readable when uploaded server-side.
      const assembly = await transloadit.createAssembly({
        files: { file: tmpPath },
        params: { steps: { ":original": { robot: "/upload/handle" } } },
        waitForCompletion: true,
      });

      return { output: extractUrl(assembly) };
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  },
});

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
      if (imageUrl.startsWith("data:")) {
        const [, base64Data] = imageUrl.split(",");
        await fs.writeFile(inputPath, Buffer.from(base64Data, "base64"));
      } else {
        const res = await fetch(imageUrl);
        if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
        await fs.writeFile(inputPath, Buffer.from(await res.arrayBuffer()));
      }

      const ffmpeg = await findFfmpeg();
      const safeX = Math.max(0, Math.min(100, xPercent));
      const safeY = Math.max(0, Math.min(100, yPercent));
      const safeW = Math.max(1, Math.min(100, widthPercent));
      const safeH = Math.max(1, Math.min(100, heightPercent));
      const cropFilter = `crop=in_w*${safeW / 100}:in_h*${safeH / 100}:in_w*${safeX / 100}:in_h*${safeY / 100}`;

      await execFileAsync(ffmpeg, ["-y", "-i", inputPath, "-vf", cropFilter, "-frames:v", "1", outputPath]);

      return { output: await uploadToTransloadit(outputPath) };
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  },
});

export const extractFrameTask = task({
  id: "extract-frame-task",
  maxDuration: 300,
  run: async (payload: { videoUrl: string; timestamp: number | string }) => {
    const { videoUrl } = payload;

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "nextflow-frame-"));
    const outputPath = path.join(tmpDir, "frame.jpg");

    try {
      const ffmpeg = await findFfmpeg();

      let seekArg: string;
      if (typeof payload.timestamp === "string" && payload.timestamp.trim().endsWith("%")) {
        const pct = parseFloat(payload.timestamp) / 100;
        const probeResult = await execFileAsync(ffmpeg, ["-i", videoUrl, "-f", "null", "-"]).catch(
          (e) => ({ stdout: "", stderr: (e as any).stderr ?? "" })
        );
        const match = (probeResult as any).stderr?.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
        if (match) {
          const totalSec =
            parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseFloat(match[3]);
          seekArg = String(Math.max(0, totalSec * pct));
        } else {
          seekArg = "0";
        }
      } else {
        seekArg = String(Number(payload.timestamp) || 0);
      }

      await execFileAsync(ffmpeg, [
        "-y", "-ss", seekArg, "-i", videoUrl,
        "-frames:v", "1", "-q:v", "2", outputPath,
      ]);

      return { output: await uploadToTransloadit(outputPath) };
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  },
});
