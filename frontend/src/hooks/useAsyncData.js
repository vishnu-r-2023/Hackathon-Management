import { useEffect, useRef, useState } from "react";

function didDependenciesChange(previous, next) {
  if (!previous || previous.length !== next.length) {
    return true;
  }

  return next.some((value, index) => !Object.is(previous[index], value));
}

export function useAsyncData(fetcher, dependencies = [], options = {}) {
  const { enabled = true, initialData = null, refreshInterval = 0 } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const previousStateRef = useRef({
    enabled,
    dependencies,
    hasFetched: false,
  });

  useEffect(() => {
    const previousState = previousStateRef.current;
    const dependenciesChanged =
      previousState.enabled !== enabled ||
      didDependenciesChange(previousState.dependencies, dependencies);
    const isBackgroundRefresh = previousState.hasFetched && !dependenciesChanged;

    previousStateRef.current = {
      enabled,
      dependencies,
      hasFetched: previousState.hasFetched,
    };

    if (!enabled) {
      setLoading(false);
      setRefreshing(false);
      previousStateRef.current = {
        enabled,
        dependencies,
        hasFetched: false,
      };
      return undefined;
    }

    let active = true;
    const controller = new AbortController();

    setLoading(!isBackgroundRefresh);
    setRefreshing(isBackgroundRefresh);
    setError(null);

    Promise.resolve(fetcher({ signal: controller.signal }))
      .then((nextData) => {
        if (!active) return;
        setData(nextData);
        previousStateRef.current = {
          enabled,
          dependencies,
          hasFetched: true,
        };
      })
      .catch((nextError) => {
        if (!active || nextError?.name === "CanceledError") return;
        setError(nextError);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          setRefreshing(false);
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
    refreshing,
    setData,
    refetch() {
      setReloadKey((value) => value + 1);
    },
  };
}
