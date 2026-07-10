import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  getDirectoryCachePath,
  getPlayerCachePath,
  readCachedHtml,
  writeCachedHtml
} from "../src/utils/fileCache.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      fs.rm(directory, { recursive: true, force: true })
    )
  );
});

describe("file cache", () => {
  it("returns null when a cached file does not exist", async () => {
    const directory = await fs.mkdtemp(
      path.join(os.tmpdir(), "baseball-faq-cache-")
    );
    temporaryDirectories.push(directory);

    await expect(
      readCachedHtml(path.join(directory, "missing.html"))
    ).resolves.toBeNull();
  });

  it("creates parent directories and reads cached HTML", async () => {
    const directory = await fs.mkdtemp(
      path.join(os.tmpdir(), "baseball-faq-cache-")
    );
    temporaryDirectories.push(directory);
    const filePath = path.join(directory, "nested", "player.html");

    await writeCachedHtml(filePath, "<html></html>");

    await expect(readCachedHtml(filePath)).resolves.toBe("<html></html>");
  });

  it("generates directory and player cache paths", () => {
    expect(getDirectoryCachePath("a")).toBe(
      path.join("cache", "directories", "a.html")
    );
    expect(getPlayerCachePath("aardsda01")).toBe(
      path.join("cache", "players", "aardsda01.html")
    );
  });
});
