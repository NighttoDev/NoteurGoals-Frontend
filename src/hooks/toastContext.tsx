import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type ToastType = "success" | "info" | "warning" | "error";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // ms, default 3000
}

interface ToastContextType {
  toasts: Toast[];
  show: (message: string, options?: { type?: ToastType; duration?: number; id?: string }) => string; // returns id
  dismiss: (id: string) => void;
  clear: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, number>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const tid = timers.current[id];
    if (tid) {
      window.clearTimeout(tid);
      delete timers.current[id];
    }
  }, []);

  const show = useCallback(
    (message: string, options?: { type?: ToastType; duration?: number; id?: string }) => {
      const id = options?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const duration = Math.max(1000, options?.duration ?? 5000);
      const type = options?.type ?? "info";
      setToasts((prev) => [...prev, { id, message, type, duration }]);
      const timeoutId = window.setTimeout(() => dismiss(id), duration);
      timers.current[id] = timeoutId;
      return id;
    },
    [dismiss]
  );

  const clear = useCallback(() => {
    Object.values(timers.current).forEach((tid) => window.clearTimeout(tid));
    timers.current = {};
    setToasts([]);
  }, []);

  const value = useMemo(() => ({ toasts, show, dismiss, clear }), [toasts, show, dismiss, clear]);

  // Global override for window.alert -> toast + flush early queue
  useEffect(() => {
    const w = window as any;
    const original = w.alert;
    w.alert = (message?: any) => {
      try {
        const text = typeof message === "string" ? message : String(message);
        const lower = text.toLowerCase();
        const type: ToastType = lower.includes("error") || lower.includes("lỗi")
          ? "error"
          : lower.includes("success") || lower.includes("thành công")
          ? "success"
          : lower.includes("warning")
          ? "warning"
          : "info";
        show(text, { type });
      } catch {
        show("Notification", { type: "info" });
      }
    };

    // Flush any alerts queued before providers mounted
    if (Array.isArray(w.__rv_alertQueue)) {
      w.__rv_alertQueue.forEach((item: { message: string }) => {
        w.alert(item.message);
      });
      w.__rv_alertQueue = []; // clear queue
    }

    return () => {
      w.alert = original;
    };
  }, [show]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
};

// Convenience helpers
export const useToastHelpers = () => {
  const { show } = useToast();
  return {
    success: (msg: string, duration?: number) => show(msg, { type: "success", duration }),
    info: (msg: string, duration?: number) => show(msg, { type: "info", duration }),
    warning: (msg: string, duration?: number) => show(msg, { type: "warning", duration }),
    error: (msg: string, duration?: number) => show(msg, { type: "error", duration }),
  };
};
