import axios from "axios";

import { readAuthSession } from "../../context/auth/storage.js";

const listeners = new Set();
let pendingRequests = 0;

function normalizeBaseUrl(url) {
  return url.replace(/\/+$/, "");
}

function resolveApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return normalizeBaseUrl(configuredBaseUrl);
  }

  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";

    // Keep the Vite proxy path for local development.
    if (isLocalHost) {
      return "";
    }
  }

  return "";
}

function publishPendingState() {
  listeners.forEach((listener) => listener(pendingRequests));
}

function startRequest() {
  pendingRequests += 1;
  publishPendingState();
}

function endRequest() {
  pendingRequests = Math.max(0, pendingRequests - 1);
  publishPendingState();
}

const client = axios.create({
  baseURL: resolveApiBaseUrl(),
});

client.interceptors.request.use(
  (config) => {
    startRequest();

    const session = readAuthSession();
    if (session.token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${session.token}`;
    }

    return config;
  },
  (error) => {
    endRequest();
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (response) => {
    endRequest();
    return response.data;
  },
  (error) => {
    endRequest();

    const message =
      error?.response?.data?.message || error?.message || "Request failed";
    const normalized = new Error(message);
    normalized.status = error?.response?.status;
    normalized.data = error?.response?.data;
    throw normalized;
  }
);

export const apiClient = {
  get(url, config = {}) {
    return client.get(url, config);
  },
  post(url, payload, config = {}) {
    return client.post(url, payload, config);
  },
  put(url, payload, config = {}) {
    return client.put(url, payload, config);
  },
  delete(url, config = {}) {
    return client.delete(url, config);
  },
};

export function subscribeToPendingRequests(listener) {
  listeners.add(listener);
  listener(pendingRequests);

  return () => {
    listeners.delete(listener);
  };
}
