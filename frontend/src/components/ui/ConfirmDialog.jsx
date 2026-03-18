import Button from "./Button.jsx";
import Modal from "./Modal.jsx";

export default function ConfirmDialog({
  confirmLabel = "Confirm",
  description,
  loading = false,
  onClose,
  onConfirm,
  open,
  title,
}) {
  return (
    <Modal description={description} onClose={onClose} open={open} title={title}>
      <div className="flex justify-end gap-3">
        <Button onClick={onClose} variant="secondary">
          Cancel
        </Button>
        <Button loading={loading} onClick={onConfirm} variant="danger">
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
