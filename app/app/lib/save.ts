// Device-local save. Nothing leaves the phone. One JSON blob in localStorage.

import { useCallback, useEffect, useState } from "react";

export interface CaughtRecord {
  count: number;
  firstCaughtAt: number;
  lastCaughtAt: number;
}

export interface SaveState {
  schema: 1;
  caught: Record<string, CaughtRecord>;
}

const KEY = "warwick.save.v1";

const empty = (): SaveState => ({ schema: 1, caught: {} });

export function loadSave(): SaveState {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as SaveState;
    if (parsed.schema !== 1) return empty(); // future: migrate()
    return parsed;
  } catch {
    return empty();
  }
}

function writeSave(state: SaveState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full / private mode — game still works in-memory */
  }
}

/** React hook owning the save; exposes a `recordCatch` action. */
export function useSave() {
  const [state, setState] = useState<SaveState>(empty);

  // Load once on mount (client only).
  useEffect(() => setState(loadSave()), []);

  // Persist on change.
  useEffect(() => {
    writeSave(state);
  }, [state]);

  const recordCatch = useCallback((characterId: string) => {
    setState((prev) => {
      const now = Date.now();
      const existing = prev.caught[characterId];
      return {
        ...prev,
        caught: {
          ...prev.caught,
          [characterId]: {
            count: (existing?.count ?? 0) + 1,
            firstCaughtAt: existing?.firstCaughtAt ?? now,
            lastCaughtAt: now,
          },
        },
      };
    });
  }, []);

  const isCaught = useCallback((id: string) => Boolean(state.caught[id]), [state]);

  return { state, recordCatch, isCaught };
}
