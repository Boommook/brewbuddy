"use client";

import { Button } from "./ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirming?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirming = false,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md rounded-xl border-2 border-harvest-orange-700 bg-camel/95 p-6 shadow-xl shadow-black/30"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="confirm-dialog-title"
          className="zilla-slab-bold text-xl text-gray-900"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm text-gray-800">{description}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={confirming}
            onClick={onCancel}
            className="cancel-button button-style shadow-style"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            disabled={confirming}
            onClick={onConfirm}
            className={
              destructive
                ? "bg-cayenne-red-700 hover:bg-cayenne-red-800 text-antique-white-100 border-2 border-cayenne-red-900 button-style shadow-style"
                : "save-button"
            }
          >
            {confirming ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
