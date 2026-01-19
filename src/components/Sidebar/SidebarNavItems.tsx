import { Link } from "@tanstack/react-router";
import cx from "classnames";

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

interface SidebarNavItemsProps {
  isCollapsed: boolean;
  items: NavItem[];
}
export default function SidebarNavItems(props: SidebarNavItemsProps) {
  const { isCollapsed, items } = props;

  return (
    <nav className="flex-1 flex flex-col gap-2 px-3">
      {items.map((item) => {
        const { label, to, icon } = item;
        return (
          <Link
            key={to}
            to={to}
            className="group relative flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent hover:border-gray-100 dark:hover:border-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
            activeProps={{
              className: "bg-sky-50 text-sky-600 dark:text-sky-500",
            }}
          >
            <span className="p-4 pe-0">{icon}</span>
            <span
              className={cx(
                "pe-4 text-sm font-medium transition-all duration-300 overflow-hidden whitespace-nowrap",
                {
                  "hidden w-0 opacity-0": isCollapsed,
                  "w-auto opacity-100": !isCollapsed,
                },
              )}
            >
              {label}
            </span>

            {isCollapsed && (
              <span className="absolute left-full ms-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                {label}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
