import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import axios from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getHtml, fetchHtml } from "../src/scraper/httpClient.js";
import { readCachedHtml } from "../src/utils/fileCache.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      fs.rm(directory, { recursive: true, force: true })
    )
  );
});

describe("fetchHtml", () => {
  it("downloads HTML with the configured request options", async () => {
    const getSpy = vi
      .spyOn(axios, "get")
      .mockResolvedValue({ data: "<html></html>" } as never);

    await expect(fetchHtml("https://example.com/page")).resolves.toBe(
      "<html></html>"
    );

    expect(getSpy).toHaveBeenCalledWith(
      "https://example.com/page",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: "text/html",
          "User-Agent": expect.any(String)
        }),
        timeout: 30_000,
        responseType: "text"
      })
    );
  });
});

describe("getHtml", () => {
  it("returns cached HTML without making a request", async () => {
    const directory = await fs.mkdtemp(
      path.join(os.tmpdir(), "baseball-faq-http-")
    );
    temporaryDirectories.push(directory);
    const cachePath = path.join(directory, "page.html");
    await fs.writeFile(cachePath, "<html>cached</html>", "utf8");
    const getSpy = vi.spyOn(axios, "get");

    await expect(getHtml("https://example.com/page", cachePath)).resolves.toBe(
      "<html>cached</html>"
    );
    expect(getSpy).not.toHaveBeenCalled();
  });

  it("downloads and stores HTML when the cache is missing", async () => {
    const directory = await fs.mkdtemp(
      path.join(os.tmpdir(), "baseball-faq-http-")
    );
    temporaryDirectories.push(directory);
    const cachePath = path.join(directory, "nested", "page.html");
    vi.spyOn(axios, "get").mockResolvedValue({
      data: "<html>fresh</html>"
    } as never);

    await expect(getHtml("https://example.com/page", cachePath)).resolves.toBe(
      "<html>fresh</html>"
    );
    await expect(readCachedHtml(cachePath)).resolves.toBe("<html>fresh</html>");
  });
});
