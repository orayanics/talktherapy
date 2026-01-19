import cx from "classnames";

export default function LogoText({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className="h-16 flex items-center justify-center border-b border-gray-100 dark:border-gray-800 mb-4">
      <div className="flex items-center gap-2 overflow-hidden px-4">
        <div className="min-w-[32px] h-8 bg-sky-600 rounded-lg flex items-center justify-center text-white font-bold">
          TT
        </div>
        <span
          className={cx(
            "font-bold text-lg whitespace-nowrap transition-opacity duration-300",
            {
              "opacity-0 w-0": isCollapsed,
              "opacity-100": !isCollapsed,
            },
          )}
        >
          TalkTherapy
        </span>
      </div>
    </div>
  );
}
