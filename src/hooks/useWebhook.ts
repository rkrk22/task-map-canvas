import { useEffect, useRef, useState } from "react";

const parseBody = async (res: Response): Promise<string | null> => {
  try {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const j = await res.json().catch(() => null);
      if (!j) return null;
      if (typeof j === "string") return j;
      return (j as any).message ?? (j as any).text ?? null;
    }
    const t = await res.text();
    return t?.trim() || null;
  } catch {
    return null;
  }
};

export function useWebhook(url?: string, intervalMs = 20000) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const tick = async () => {
      if (!url) return;
      try {
        const res = await fetch(url, { method: "GET" });
        if (!res.ok) return;
        const msg = await parseBody(res);
        if (mounted && msg) setMessage(msg);
      } catch {}
    };
    tick();
    timer.current = window.setInterval(tick, intervalMs) as unknown as number;
    return () => {
      mounted = false;
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [url, intervalMs]);

  return { message, setMessage };
}
