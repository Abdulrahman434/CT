const HISTORY_KEY = 'careinn-call-history';
const MAX_ENTRIES = 100;  // keep last 100 calls

export type CallHistoryEntry = {
  id: string;
  extension: string;
  name: string;
  direction: 'incoming' | 'outgoing';
  type: 'missed' | 'attended';
  timestamp: number;       // Unix ms
  durationSeconds: number; // 0 if missed
};

export function loadHistory(): CallHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEntry(entry: CallHistoryEntry): void {
  try {
    const existing = loadHistory();
    // Prepend new entry (most recent first)
    const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('callHistory.saveEntry failed', e);
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {}
}

/** Format duration seconds to "mm:ss" */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Format timestamp to human-readable time */
export function formatCallTime(timestamp: number): string {
  const d = new Date(timestamp);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const time = d.toLocaleTimeString([], { 
    hour: '2-digit', minute: '2-digit' 
  });

  if (isToday) return time;
  if (isYesterday) return `Yesterday ${time}`;
  return `${d.toLocaleDateString([], { 
    month: 'short', day: 'numeric' 
  })} ${time}`;
}

/** Group entries by date label for display */
export function groupByDate(entries: CallHistoryEntry[]): 
    { label: string; entries: CallHistoryEntry[] }[] {
  const groups: Map<string, CallHistoryEntry[]> = new Map();
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const entry of entries) {
    const d = new Date(entry.timestamp);
    let label: string;
    if (d.toDateString() === now.toDateString()) {
      label = 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      label = 'Yesterday';
    } else {
      label = d.toLocaleDateString([], { 
        weekday: 'long', month: 'short', day: 'numeric' 
      });
    }
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(entry);
  }

  return Array.from(groups.entries()).map(([label, entries]) => ({
    label,
    entries,
  }));
}
