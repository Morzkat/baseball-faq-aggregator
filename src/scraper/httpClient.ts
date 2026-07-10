import axios from "axios";
import {
  MAX_RETRIES,
  REQUEST_DELAY_MS,
  USER_AGENT
} from "../config/constants.js";
import {
  readCachedHtml,
  writeCachedHtml
} from "../utils/fileCache.js";

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function fetchHtml(url: string): Promise<string> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      if (attempt > 0) {
        await sleep(REQUEST_DELAY_MS * attempt * 2);
      }

      const response = await axios.get<string>(url, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html"
        },
        timeout: 30_000,
        responseType: "text"
      });

      return response.data;
    } catch (error) {
      lastError = error;

      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined;

      const shouldRetry =
        status === undefined || status === 429 || status >= 500;

      if (!shouldRetry) {
        throw error;
      }
    }
  }

  throw lastError;
}

export async function getHtml(
  url: string,
  cachePath: string
): Promise<string> {
  const cachedHtml = await readCachedHtml(cachePath);

  if (cachedHtml !== null) {
    return cachedHtml;
  }

  const html = await fetchHtml(url);
  await writeCachedHtml(cachePath, html);

  return html;
}
