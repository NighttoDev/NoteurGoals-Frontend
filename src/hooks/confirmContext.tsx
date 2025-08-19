import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import ConfirmDialog from "../components/Common/ConfirmDialog";

export type ConfirmVariant = "default" | "danger";

export interface ConfirmOptions {
  title?: string;
  message?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant; // 'danger' -> red confirm button
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialogs, setDialogs] = useState<Array<{ id: string; options: ConfirmOptions; resolve: (value: boolean) => void }>>([]);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setDialogs((prev) => [...prev, { id, options, resolve }]);
    });
  }, []);

  const handleClose = useCallback((id: string, result: boolean) => {
    setDialogs((prev) => {
      const dlg = prev.find((d) => d.id === id);
      if (dlg) dlg.resolve(result);
      return prev.filter((d) => d.id !== id);
    });
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {dialogs.map((dlg) => (
        <ConfirmDialog
          key={dlg.id}
          open
          onCancel={() => handleClose(dlg.id, false)}
          onConfirm={() => handleClose(dlg.id, true)}
          {...dlg.options}
        />
      ))}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmProvider");
  return ctx.confirm;
};
