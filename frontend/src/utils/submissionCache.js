const STORAGE_KEY = "hacksphere.participant-submissions";

function readCache() {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeCache(cache) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

export function getCachedSubmission(teamId) {
  if (!teamId) return null;
  const cache = readCache();
  return cache[teamId] || null;
}

export function setCachedSubmission(teamId, submission) {
  if (!teamId) return;
  const cache = readCache();
  cache[teamId] = submission;
  writeCache(cache);
}
