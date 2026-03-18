import { useEffect, useState } from "react";

export function useAsyncData(fetcher, dependencies = [], options = {}) {
  const { enabled = true, initialData = null, refreshInterval = 0 } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    Promise.resolve(fetcher({ signal: controller.signal }))
      .then((nextData) => {
        if (!active) return;
        setData(nextData);
      })
      .catch((nextError) => {
        if (!active || nextError?.name === "CanceledError") return;
        setError(nextError);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [enabled, reloadKey, ...dependencies]);

  useEffect(() => {
    if (!enabled || !refreshInterval) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setReloadKey((value) => value + 1);
    }, refreshInterval);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, refreshInterval, ...dependencies]);

  return {
    data,
    error,
    loading,
    setData,
    refetch() {
      setReloadKey((value) => value + 1);
    },
  };
}
