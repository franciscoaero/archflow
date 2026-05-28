export interface TimerState {
  isRunning: boolean;
  projectId: string;
  partId: string | null;
  description: string;
  startedAt: number;
}

const STORAGE_KEY = "archflow-timer";

export function getTimerState(): TimerState | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as TimerState;
  } catch {
    return null;
  }
}

export function saveTimerState(state: TimerState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearTimerState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getElapsedSeconds(startedAt: number): number {
  return Math.floor((Date.now() - startedAt) / 1000);
}

export function formatElapsed(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
