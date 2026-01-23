import { useEffect, useRef } from "react";

interface ModalBodyProps {
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
  isOpen: boolean;
}

export default function ModalBody(props: ModalBodyProps) {
  const { children, onClose, className, isOpen } = props;
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className={`modal modal-middle ${className}`}
      onClose={onClose}
      onCancel={onClose}
    >
      <div className="modal-box">{children}</div>
    </dialog>
  );
}
