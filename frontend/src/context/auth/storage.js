const STORAGE_KEYS = {
  token: "hacksphere.token",
  user: "hacksphere.user",
};

function parseUser(rawUser) {
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

function readFrom(storage) {
  return {
    token: storage.getItem(STORAGE_KEYS.token) || "",
    user: parseUser(storage.getItem(STORAGE_KEYS.user)),
  };
}

function writeTo(storage, token, user) {
  if (token) {
    storage.setItem(STORAGE_KEYS.token, token);
  } else {
    storage.removeItem(STORAGE_KEYS.token);
  }

  if (user) {
    storage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  } else {
    storage.removeItem(STORAGE_KEYS.user);
  }
}

export function readAuthSession() {
  if (typeof window === "undefined") {
    return { token: "", user: null, remember: true };
  }

  const local = readFrom(window.localStorage);
  if (local.token) return { ...local, remember: true };

  const session = readFrom(window.sessionStorage);
  return { ...session, remember: false };
}

export function writeAuthSession(token, user, remember = true) {
  if (typeof window === "undefined") return;

  writeTo(window.localStorage, "", null);
  writeTo(window.sessionStorage, "", null);
  writeTo(remember ? window.localStorage : window.sessionStorage, token, user);
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  writeTo(window.localStorage, "", null);
  writeTo(window.sessionStorage, "", null);
}
