/**
 * The ONLY place in this service that should make an HTTP request.
 * Enforces: SSRF protection (§28), a hard response-size ceiling (§28), a
 * timeout (§21), and capped redirects.
 *
 * Uses Node's core http/https modules directly rather than the global
 * fetch() (undici). undici's HTTP parser is strict about spec compliance
 * and throws HTTPParserError on servers that send slightly malformed
 * headers — hit immediately against a real target (nse.co.ke). Node's
 * core http/https modules support `insecureHTTPParser: true`, which
 * relaxes parsing without weakening any of our own safety checks.
 *
 * Switching away from fetch() also means we lose its automatic
 * Accept-Encoding negotiation and transparent gzip/deflate/br
 * decompression — undici does this silently, so it wasn't obvious until
 * real NSE PDFs came back as unparseable garbage (they were gzip-
 * compressed on the wire; we were storing/parsing the compressed bytes
 * directly). Restored explicitly below. The size cap is enforced on the
 * DECOMPRESSED stream, not the wire bytes — capping only the compressed
 * size would let a small compressed payload decompress into something
 * enormous (a "zip bomb over HTTP"), which is exactly the kind of thing
 * §28 asks us to guard against.
 */
import http from "node:http";
import https from "node:https";
import zlib from "node:zlib";
import type { Readable } from "node:stream";
import { assertPublicUrl } from "./urlSafety.js";
import { env } from "../config/index.js";

export class FetchTooLargeError extends Error {}
export class FetchTimeoutError extends Error {}

export interface FetchResult {
  finalUrl: string;
  status: number;
  headers: Headers;
  body: Buffer;
}

const MAX_REDIRECTS = 5;

function toHeadersObject(raw: http.IncomingHttpHeaders): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) continue;
    headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  }
  return headers;
}

function decompressStream(res: http.IncomingMessage): Readable {
  const encoding = (res.headers["content-encoding"] ?? "").toLowerCase();
  switch (encoding) {
    case "gzip":
    case "x-gzip":
      return res.pipe(zlib.createGunzip());
    case "deflate":
      return res.pipe(zlib.createInflate());
    case "br":
      return res.pipe(zlib.createBrotliDecompress());
    default:
      return res;
  }
}

function requestOnce(
  url: URL,
  opts: { maxBytes: number; timeoutMs: number },
): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: Buffer }> {
  return new Promise((resolve, reject) => {
    const lib = url.protocol === "https:" ? https : http;

    const req = lib.request(
      url,
      {
        method: "GET",
        headers: {
          "User-Agent": env.CRAWLER_USER_AGENT,
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate, br",
        },
        insecureHTTPParser: true,
        timeout: opts.timeoutMs,
      },
      (res) => {
        const decompressed = decompressStream(res);
        const chunks: Buffer[] = [];
        let total = 0;

        decompressed.on("data", (chunk: Buffer) => {
          total += chunk.length;
          if (total > opts.maxBytes) {
            req.destroy();
            reject(new FetchTooLargeError(`${url} exceeded ${opts.maxBytes} bytes after decompression`));
            return;
          }
          chunks.push(chunk);
        });

        decompressed.on("end", () => {
          resolve({ status: res.statusCode ?? 0, headers: res.headers, body: Buffer.concat(chunks) });
        });

        decompressed.on("error", (err) => {
          reject(new Error(`Decompression failed for ${url} (content-encoding: ${res.headers["content-encoding"] ?? "none"}): ${err.message}`));
        });
      },
    );

    req.on("timeout", () => {
      req.destroy(new FetchTimeoutError(`Request to ${url} timed out after ${opts.timeoutMs}ms`));
    });

    req.on("error", (err) => {
      if (err instanceof FetchTimeoutError) {
        reject(err);
        return;
      }
      reject(new Error(`Request to ${url} failed: ${err.message}`));
    });

    req.end();
  });
}

export async function safeFetch(
  url: string,
  opts: { maxBytes?: number; timeoutMs?: number } = {},
): Promise<FetchResult> {
  const maxBytes = opts.maxBytes ?? env.MAX_RESPONSE_SIZE_BYTES;
  const timeoutMs = opts.timeoutMs ?? env.DEFAULT_REQUEST_TIMEOUT_MS;

  let currentUrl = url;
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
    // Re-validate on every hop — a redirect chain is a classic SSRF
    // bypass (public URL that 302s to an internal one).
    const validated = await assertPublicUrl(currentUrl);

    const { status, headers, body } = await requestOnce(validated, { maxBytes, timeoutMs });

    if (status >= 300 && status < 400) {
      const location = headers.location;
      if (!location) return { finalUrl: currentUrl, status, headers: toHeadersObject(headers), body: Buffer.alloc(0) };
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    return { finalUrl: currentUrl, status, headers: toHeadersObject(headers), body };
  }

  throw new Error(`${url}: exceeded ${MAX_REDIRECTS} redirects`);
}