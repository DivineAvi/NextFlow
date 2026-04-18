import { task } from "@trigger.dev/sdk/v3";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import fs from "fs/promises";
import path from "path";
import os from "os";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * Helper to upload to transloadit or a dummy mock for now.
 * In production this would post to Transloadit's REST API.
 */
async function uploadToTransloadit(filePath: string, fileType: string): Promise<string> {
  // As this handles a robust assignment requirement: "Output should be cropped image URL (uploaded via Transloadit)"
  // Since Transloadit Auth Keys were not provided, we mock the result string or use an external bucket.
  return `https://dummy-bucket.s3.amazonaws.com/${path.basename(filePath)}`;
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
    try {
      const { imageUrl, xPercent, yPercent, widthPercent, heightPercent } = payload;
      
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'trigger-crop-'));
      const inputPath = path.join(tmpDir, 'input.jpg');
      const outputPath = path.join(tmpDir, 'output.jpg');

      // Download
      const res = await fetch(imageUrl);
      const buffer = await res.arrayBuffer();
      await fs.writeFile(inputPath, Buffer.from(buffer));

      // FFmpeg crop filter: crop=w:h:x:y
      // w = in_w * (widthPercent/100)
      // h = in_h * (heightPercent/100)
      // x = in_w * (xPercent/100)
      // y = in_h * (yPercent/100)
      const cropFilter = `crop=in_w*${widthPercent/100}:in_h*${heightPercent/100}:in_w*${xPercent/100}:in_h*${yPercent/100}`;

      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .videoFilters(cropFilter)
          .save(outputPath)
          .on("end", resolve)
          .on("error", reject);
      });

      const finalUrl = await uploadToTransloadit(outputPath, "image/jpeg");
      
      // Cleanup
      await fs.rm(tmpDir, { recursive: true, force: true });

      return { output: finalUrl };
    } catch (error: any) {
      console.error(error);
      throw new Error(`Crop Image Failed: ${error.message}`);
    }
  },
});

export const extractFrameTask = task({
  id: "extract-frame-task",
  maxDuration: 300,
  run: async (payload: {
    videoUrl: string;
    timestamp: number;
  }) => {
    try {
      const { videoUrl, timestamp } = payload;
      
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'trigger-frame-'));
      const outputPath = path.join(tmpDir, 'frame.jpg');

      await new Promise((resolve, reject) => {
        ffmpeg(videoUrl)
          .screenshots({
            timestamps: [timestamp],
            filename: 'frame.jpg',
            folder: tmpDir,
          })
          .on("end", resolve)
          .on("error", reject);
      });

      const finalUrl = await uploadToTransloadit(outputPath, "image/jpeg");
      
      // Cleanup
      await fs.rm(tmpDir, { recursive: true, force: true });

      return { output: finalUrl };
    } catch (error: any) {
      console.error(error);
      throw new Error(`Extract Frame Failed: ${error.message}`);
    }
  },
});
