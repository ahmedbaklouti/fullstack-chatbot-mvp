import type { ChatResponse, Message } from "@chatbot/shared";

// API utilities for this interview MVP:
// - Keep the surface area small (fetchChatHistory / sendChatMessage)
// - Provide a friendly, stable error message for the UI
// - Avoid “stuck pending” states by enforcing a timeout
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const REQUEST_TIMEOUT_MS = 15_000;

async function readResponseErrorMessage(res: Response): Promise<string> {
  // Backend is controlled (NestJS). For errors it commonly returns:
  // { message: string | string[]; statusCode: number; error: string }
  // We only extract the message if it’s readable, otherwise we fallback to raw text.
  const fallback = `Request failed (${res.status})`;
  const text = await res.text().catch(() => "");
  if (!text) return fallback;

  try {
    const data = JSON.parse(text) as { message?: unknown };
    const message = data?.message;

    if (typeof message === "string" && message.trim()) return message;
    if (Array.isArray(message) && message.every((m) => typeof m === "string")) {
      return message.join(", ");
    }

    return text;
  } catch {
    return text;
  }
}

function isAbortError(e: unknown) {
  return e instanceof DOMException && e.name === "AbortError";
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  timeoutMs: number,
) {
  // Fast feedback when the browser knows we’re offline.
  // (Still keep a real timeout for cases where the network “hangs”.)
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new Error("Connection lost. Check your internet connection.");
  }

  // One AbortController is used to combine:
  // - caller abort (React Query / manual AbortSignal)
  // - our timeout abort
  const controller = new AbortController();
  let didTimeout = false;
  const timeoutId = window.setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);

  const initSignal = init?.signal;
  if (initSignal) {
    if (initSignal.aborted) controller.abort();
    else
      initSignal.addEventListener("abort", () => controller.abort(), {
        once: true,
      });
  }

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (e) {
    if (isAbortError(e)) {
      if (didTimeout) {
        // Timeout: show a clear message rather than a generic AbortError.
        throw new Error("Timeout exceeded. Please try again.", {
          cause: e,
        });
      }
      throw e;
    }

    if (e instanceof TypeError) {
      // Typical fetch network failure (DNS, server down, CORS, etc.)
      throw new Error(
        "Connection lost. Check your internet connection.",
        {
          cause: e,
        },
      );
    }

    throw e;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function fetchChatHistory(
  signal?: AbortSignal,
): Promise<Message[]> {
  const res = await fetchWithTimeout(
    `${API_BASE_URL}/chat/history`,
    {
      signal,
    },
    REQUEST_TIMEOUT_MS,
  );

  if (!res.ok) {
    throw new Error(await readResponseErrorMessage(res));
  }

  return (await res.json()) as Message[];
}

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const res = await fetchWithTimeout(
    `${API_BASE_URL}/chat`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ message }),
    },
    REQUEST_TIMEOUT_MS,
  );

  if (!res.ok) {
    throw new Error(await readResponseErrorMessage(res));
  }

  return (await res.json()) as ChatResponse;
}
