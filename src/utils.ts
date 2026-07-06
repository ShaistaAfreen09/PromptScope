/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export async function safeJson<T = any>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error(
      `Received non-JSON response (type: '${contentType || "unknown"}'). Status: ${res.status}. Content snippet: ${text.substring(0, 100).replace(/</g, "&lt;").replace(/>/g, "&gt;")}`
    );
  }
  return res.json() as Promise<T>;
}
