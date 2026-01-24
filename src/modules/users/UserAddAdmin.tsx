import ModalHeader from "~/components/Modal/ModalHeader";

interface UserAddAdminProps {
  id: string;
}

export default function UserAddAdmin(props: UserAddAdminProps) {
  const { id } = props;

  return (
    <dialog id={id} className="modal">
      <div className="modal-box">
        <div className="flex flex-col gap-4">
          <ModalHeader>Add Admin User</ModalHeader>
          <label className="input w-full">
            <span className="label">Email</span>
            <input type="email" placeholder="email@email.com" />
          </label>

          <div className="flex flex-col items-center gap-2 "></div>
        </div>
        <div className="modal-action flex-row">
          <button
            className="btn"
            onClick={() => {
              const modal = document.getElementById(
                id,
              ) as HTMLDialogElement | null;
              modal?.close();
            }}
          >
            Close
          </button>
          <button className="btn btn-primary">Submit</button>
        </div>
      </div>
    </dialog>
  );
}
