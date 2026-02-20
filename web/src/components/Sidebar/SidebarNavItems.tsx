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
    <nav className="flex-1 flex flex-col gap-1 px-4">
      {items.map((item) => {
        const { label, to, icon } = item;
        return (
          <Link
            key={to}
            to={to}
            className="flex items-center justify-start gap-4 py-4 text-gray-400 hover:text-black"
            activeProps={{
              className:
                "text-primary hover:text-primary [&>span]:drop-shadow [&>span]:drop-shadow-primary/30",
            }}
          >
            <span>{icon}</span>
            <p className="text-sm transition-all duration-300 w-auto opacity-100">
              {label}
            </p>
          </Link>
        );
      })}
    </nav>
  );
}
