import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { sanitizeLayout, sanitizeSafePath } from "../utils/ffmpegSecurity.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "../temp/renders");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

export const renderComposition = async ({
  sessionId,
  layout,
  inputs,
  duration
}) => {
  // FFmpeg fixup: Validate layout and sanitize inputs to prevent injection
  try {
    layout = sanitizeLayout(layout);
    // Sanitize input URLs if they are local file paths
    inputs = inputs.map(input => {
      if (input.url && input.url.startsWith('/')) {
        // Assume local path, sanitize
        input.url = sanitizeSafePath(input.url, path.join(__dirname, "../temp"));
      }
      return input;
    });
  } catch (error) {
    throw new Error(`Invalid input: ${error.message}`);
  }

  const outputPath = path.join(
    OUTPUT_DIR,
    `render_${sessionId}_${Date.now()}.mp4`
  );

  return new Promise((resolve, reject) => {
    const command = ffmpeg();
    const filters = [];
    const count = inputs.length;

    inputs.forEach(input => {
      command.input(input.url);
    });

    // audio
    filters.push(
      inputs.map((_, i) => `[${i}:a]`).join("") +
        `amix=inputs=${count}[aout]`
    );

    // video
    if (layout === "grid") {
      inputs.forEach((_, i) => {
        filters.push(`[${i}:v]scale=960:540[v${i}]`);
      });

      if (count === 1) {
        filters.push(`[0:v]scale=1920:1080[vout]`);
      } else if (count === 2) {
        filters.push(`[v0][v1]hstack=inputs=2[vout]`);
      } else {
        const stack = inputs.map((_, i) => `[v${i}]`).join("");
        filters.push(
          `${stack}xstack=inputs=${count}:layout=0_0|w0_0|0_h0|w0_h0[vout]`
        );
      }
    } else if (layout === "split") {
      inputs.forEach((_, i) => {
        filters.push(
          `[${i}:v]scale=960:1080:force_original_aspect_ratio=increase,crop=960:1080[v${i}]`
        );
      });
      filters.push(`[v0][v1]hstack=inputs=2[vout]`);
    } else if (layout === "pip") {
      filters.push(`[0:v]scale=1920:1080[base]`);
      filters.push(`[1:v]scale=480:270[pip]`);
      filters.push(
        `[base][pip]overlay=main_w-overlay_w-20:main_h-overlay_h-20[vout]`
      );
    } else {
      filters.push(`[0:v]scale=1920:1080[vout]`);
    }

    command
      .complexFilter(filters)
      .outputOptions([
        "-map [vout]",
        "-map [aout]",
        "-c:v libx264",
        "-preset ultrafast",
        "-c:a aac"
      ])
      .output(outputPath)
      .on("end", () => {
        resolve({
          success: true,
          url: `/temp/renders/${path.basename(outputPath)}`,
          path: outputPath
        });
      })
      .on("error", reject)
      .run();
  });
};
