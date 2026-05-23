import { useEffect, useState } from "react";

const API = "/api";

export function useContent(endpoint) {
  const [data, setData] = useState(undefined);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setData(undefined);
    setError(null);

    fetch(`${API}/content/${endpoint}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e);
      });

    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  return { data, error, loading: data === undefined && !error };
}
