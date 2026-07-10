import fs from "node:fs/promises";
import path from "node:path";

export async function writeJsonFile(
  filePath: string,
  data: unknown
): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function logProgress(
  current: number,
  total: number,
  message: string
): void {
  console.log(`[${current}/${total}] ${message}`);
}
