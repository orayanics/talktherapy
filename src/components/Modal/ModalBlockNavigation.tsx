import { useState } from "react";

import ModalHeader from "~/components/Modal/ModalHeader";
import ModalBody from "~/components/Modal/ModalBody";
import ModalFooter from "~/components/Modal/ModalFooter";

interface ModalBlockNavigationProps {
  isOpen: boolean;
  onReset: () => void;
  onProceed: () => void;
  children?: React.ReactNode;
}

export default function ModalBlockNavigation(props: ModalBlockNavigationProps) {
  const { isOpen, onReset, onProceed, children } = props;

  return (
    <ModalBody isOpen={isOpen} onClose={onReset}>
      <ModalHeader>Unsaved Changes</ModalHeader>
      {children ? (
        <>{children}</>
      ) : (
        <p className="text-gray-700 mb-6">
          You have unsaved changes. Are you sure you want to leave this page?
        </p>
      )}
      <ModalFooter>
        <button onClick={onReset} className="btn btn-ghost">
          Stay on Page
        </button>
        <button onClick={onProceed} className="btn btn-error">
          Leave Page
        </button>
      </ModalFooter>
    </ModalBody>
  );
}
