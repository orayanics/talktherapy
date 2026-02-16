import { useEffect } from "react";

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalBody(props: ModalBodyProps) {
  const { children, onClose, className, isOpen } = props;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const modalClassName = [
    "modal",
    "modal-middle",
    isOpen ? "modal-open" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={modalClassName}>
      <div className="modal-box">{children}</div>
      <button type="button" className="modal-backdrop" onClick={onClose}>
        Close
      </button>
    </div>
  );
}
