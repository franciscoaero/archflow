function getActiveProfileId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("archflow-profile") || "";
}

export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const profileId = getActiveProfileId();
  const headers = new Headers(options?.headers);
  if (profileId) {
    headers.set("x-profile-id", profileId);
  }
  return fetch(url, { ...options, headers });
}
