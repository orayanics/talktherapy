import { Link } from "@tanstack/react-router";
import { FaHome, FaUsers, FaFile, FaCog } from "react-icons/fa";

const SUDO_NAV_ITEMS = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: <FaHome />,
  },
  {
    label: "Users",
    to: "/users",
    icon: <FaUsers />,
  },
  {
    label: "Logs",
    to: "/logs",
    icon: <FaFile />,
  },
  {
    label: "Settings",
    to: "/settings",
    icon: <FaCog />,
  },
];

export default function SidebarSudo() {
  return (
    <nav className="flex flex-col gap-4">
      {SUDO_NAV_ITEMS.map((item) => {
        const { label, to, icon } = item;
        return (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-2 p-2 hover:bg-red-100 rounded"
          >
            <span className="text-xl">{icon}</span>
            <span>{label}</span>
          </Link>
        );
      })}

      <button className="btn-primary">Logout</button>
    </nav>
  );
}

function Tooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
        {label}
      </div>
    </div>
  );
}
