import { Link } from "@tanstack/react-router";
import cx from "classnames";

import {
  FaHome,
  FaFile,
  FaCog,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import LogoText from "~/components/Logo/LogoText";
import SidebarNavItems from "./SidebarNavItems";

const SUDO_NAV_ITEMS = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: <FaHome size={20} />,
  },
  // {
  //   label: "Users",
  //   to: "/users",
  //   icon: <FaUsers size={20} />,
  // },
  {
    label: "Logs",
    to: "/logs",
    icon: <FaFile size={20} />,
  },
  {
    label: "Settings",
    to: "/settings",
    icon: <FaCog size={20} />,
  },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function SidebarSudo(props: SidebarProps) {
  const { isCollapsed, setIsCollapsed } = props;

  return (
    <aside
      className={cx("sidebar", {
        "w-20": isCollapsed,
        "w-48": !isCollapsed,
      })}
    >
      <LogoText isCollapsed={isCollapsed} />
      <SidebarNavItems isCollapsed={isCollapsed} items={SUDO_NAV_ITEMS} />
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors cursor-pointer"
        >
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>
    </aside>
  );
}
