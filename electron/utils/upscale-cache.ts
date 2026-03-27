import fs from "fs";
import crypto from "crypto";

type UpscaleCacheMetadata = {
  sourceImagePath: string;
  sourceImageHash: string;
};

const CACHE_FILE_SUFFIX = ".upscayl-cache.json";

function getCacheFilePath(outputFilePath: string): string {
  return `${outputFilePath}${CACHE_FILE_SUFFIX}`;
}

export async function getFileHash(filePath: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("error", (error) => reject(error));
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

export function readUpscaleCacheMetadata(
  outputFilePath: string,
): UpscaleCacheMetadata | null {
  try {
    const cacheFilePath = getCacheFilePath(outputFilePath);
    if (!fs.existsSync(cacheFilePath)) return null;

    const rawData = fs.readFileSync(cacheFilePath, "utf-8");
    const parsed = JSON.parse(rawData) as Partial<UpscaleCacheMetadata>;

    if (
      typeof parsed.sourceImagePath !== "string" ||
      typeof parsed.sourceImageHash !== "string"
    ) {
      return null;
    }

    return {
      sourceImagePath: parsed.sourceImagePath,
      sourceImageHash: parsed.sourceImageHash,
    };
  } catch {
    return null;
  }
}

export function writeUpscaleCacheMetadata(
  outputFilePath: string,
  metadata: UpscaleCacheMetadata,
): void {
  const cacheFilePath = getCacheFilePath(outputFilePath);
  fs.writeFileSync(cacheFilePath, JSON.stringify(metadata));
}
