import {
  ErrorComponent,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  });

  console.error(error);

  return (
    <div className="min-w-0 flex flex-col items-center justify-center z-10 fixed inset-0">
      <div className="border rounded-lg bg-white shadow-lg/10 flex flex-col items-center justify-center gap-4 p-6 [&>div:first-of-type]:p-0!">
        <ErrorComponent error={error} />
        <div className="flex gap-2 items-center flex-wrap">
          <button
            onClick={() => {
              router.invalidate();
            }}
            className={`btn btn-success rounded-sm uppercase font-extrabold`}
          >
            Try Again
          </button>
          {isRoot ? (
            <Link
              to="/"
              className={`btn btn-primary rounded-sm uppercase font-extrabold`}
            >
              Home
            </Link>
          ) : (
            <Link
              to="/"
              className={`btn btn-info rounded-sm uppercase font-extrabold`}
              onClick={(e) => {
                e.preventDefault();
                window.history.back();
              }}
            >
              Go Back
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
