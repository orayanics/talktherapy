import { Link } from "@tanstack/react-router";

export function NotFound({ children }: { children?: any }) {
  return (
    <div className="h-screen px-2 md:p-0 pattern-boxes pattern-color-primary pattern-bg-white pattern-size-8">
      <div className="fixed inset-0 z-10 m-auto space-y-4 p-6 border rounded-lg w-100 h-fit bg-white shadow-lg/10">
        <div className="text-center flex flex-col">
          <h1 className="text-2xl font-bold">Oops!</h1>
          {children || <p>The page you are looking for does not exist.</p>}
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => window.history.back()}
            className="btn btn-success text-white rounded-sm uppercase font-black text-sm"
          >
            Go back
          </button>
          <Link
            to="/"
            className="btn btn-info text-white rounded-sm uppercase font-black text-sm"
          >
            Start Over
          </Link>
        </div>
      </div>
    </div>
  );
}
