import { PROGRESS_CHANGED_EVENT } from "@/lib/storage/safe-storage";

/** Tells every mounted screen that stored study data changed (same tab). */
export function emitStudyChanged(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(PROGRESS_CHANGED_EVENT));
}

/** Subscribe to study-data changes from this tab and from other tabs. Returns an unsubscribe. */
export function onStudyChanged(listener: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (!e.key || e.key.startsWith("pqb:")) listener();
  };
  window.addEventListener(PROGRESS_CHANGED_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(PROGRESS_CHANGED_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}
