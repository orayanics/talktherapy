import { Link } from "@tanstack/react-router";

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

interface SidebarNavItemsProps {
  items: NavItem[];
}
export default function SidebarNavItems(props: SidebarNavItemsProps) {
  const { items } = props;

  return (
    <nav className="flex-1 flex flex-col gap-1 px-2">
      {items.map((item) => {
        const { label, to, icon } = item;
        return (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-2 p-2 rounded-lg text-gray-600  border border-transparent hover:bg-base-200 hover:border-gray-100"
            activeProps={{
              className: "bg-base-300 !text-gray-800 !border !border-base-100",
            }}
          >
            <span>{icon}</span>
            <span className="text-sm transition-all duration-300 w-auto opacity-100">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
