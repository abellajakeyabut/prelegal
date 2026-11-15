// Same origin in the Docker image (FastAPI serves the frontend); `next dev` sets
// NEXT_PUBLIC_API_URL to reach the separately running backend.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}
