import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/(private)/_auth/_role-layout/(shared)/settings",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="grid grid-cols-12 gap-4 h-[96vh]">
      <ColumnContent header="Profile">
        <button>Update Profile</button>
      </ColumnContent>

      <ColumnContent header="Settings">
        <h1>Settings</h1>
        <button>Change Password</button>
      </ColumnContent>
    </div>
  );
}

function ColumnContent({
  header,
  children,
}: {
  header: string;
  children: React.ReactNode;
}) {
  return (
    <div className="col-span-3 bg-red-50">
      <h1>{header}</h1>
      {children}
    </div>
  );
}
