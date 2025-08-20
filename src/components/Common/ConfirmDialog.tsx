import React from "react";
import "../../assets/css/Common/confirm.css";

interface Props {
  open: boolean;
  title?: string;
  message?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<Props> = ({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;
  return (
    <div className="rv-cfm-overlay" onClick={onCancel}>
      <div className="rv-cfm-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="rv-cfm-header">
          <h3>{title}</h3>
        </div>
        <div className="rv-cfm-body">
          {typeof message === "string" ? <p>{message}</p> : message}
        </div>
        <div className="rv-cfm-footer">
          <button className="rv-btn rv-btn-secondary" onClick={onCancel}>{cancelText}</button>
          <button className={`rv-btn ${variant === 'danger' ? 'rv-btn-danger' : 'rv-btn-primary'}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
