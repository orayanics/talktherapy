import { useScrollToBottom } from "~/utils/scroll";

import ModalHeader from "~/components/Modal/ModalHeader";
import ModalBody from "~/components/Modal/ModalBody";
import ModalFooter from "~/components/Modal/ModalFooter";

interface ConsentsPatientProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: (agreed: boolean) => void;
}

export default function ConsentsPatient(props: ConsentsPatientProps) {
  const { isOpen = false, onClose, onAgree } = props;
  const { isBottom, bottomRef } = useScrollToBottom();

  const handleConsent = () => onAgree(true);
  const handleClose = () => onClose();

  return (
    <ModalBody isOpen={isOpen} onClose={handleClose}>
      <ModalHeader>Evaluation & Therapy Sessions</ModalHeader>
      <div>
        <h3 className="font-semibold mb-2">Consent Agreement</h3>
        <p className="mb-4">
          Please read and agree to the terms and conditions below.
        </p>
        <div
          ref={bottomRef}
          className="flex flex-col gap-4 h-100 overflow-y-scroll"
        >
          <ConsentBody />
        </div>
      </div>

      <ModalFooter>
        <button className="btn btn-ghost" type="button" onClick={handleClose}>
          Close
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleConsent}
          disabled={false || !isBottom}
        >
          Agree
        </button>
      </ModalFooter>
    </ModalBody>
  );
}

const EVALUATION_THERAPY = [
  {
    heading: "Patient Contact",
    content:
      "Administrators and clinicians will have access to the client's contact details. If and when the client changes contact details, it must be reported to the assigned clinician immediately.",
  },
  {
    heading: "Patient Handling",
    content:
      "That the assessment and intervention will be done by the clinicians registered in the website",
  },
  {
    heading: "In-session Documentation",
    content:
      "That SOAP templates will be used to document the sessions. These will be recorded in text. The recordings will be used in teaching, learning activities, and research purposes.",
  },
];

const ASSESSMENT_DOCUMENTATION = [
  {
    heading: "Purpose & Use",
    content:
      "That documents pertaining to the course of assessment and treatment will be used for teaching, learning, and research purposes. Personal information obtained pertaining to the case will be held in strict confidentiality.",
  },
  {
    heading: "Data Storage",
    content:
      "That the soft copy data of the client will be stored and can only be accessed by current authorized personnel in the website. Soft copy data will be stored in MongoDB. Data will be kept until they are active as current clients of the center.",
  },
  {
    heading: "Account Disposal",
    content:
      "That once the client is no longer an active member, data and access to the website will be disposed of after 3 months of inactivity in the website.",
  },
];

function ConsentBody() {
  return (
    <>
      <ol className="flex flex-col gap-2">
        {EVALUATION_THERAPY.map((item) => {
          const { heading, content } = item;
          return (
            <li key={heading}>
              <p className="font-semibold">{heading}</p>
              <p>{content}</p>
            </li>
          );
        })}
      </ol>

      <ol className="flex flex-col gap-2">
        {ASSESSMENT_DOCUMENTATION.map((item) => {
          const { heading, content } = item;
          return (
            <li key={heading}>
              <p className="font-semibold">{heading}</p>
              <p>{content}</p>
            </li>
          );
        })}
      </ol>
    </>
  );
}
