import { Link } from "@tanstack/react-router";
import cx from "classnames";

import {
  FaHome,
  FaFile,
  FaCog,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
} from "react-icons/fa";

import LogoText from "~/components/Logo/LogoText";
import SidebarNavItems from "./SidebarNavItems";

const SUDO_NAV_ITEMS = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: <FaHome size={16} />,
  },
  {
    label: "Users",
    to: "/users",
    icon: <FaUser size={16} />,
  },
  {
    label: "Logs",
    to: "/logs",
    icon: <FaFile size={16} />,
  },
  {
    label: "Profile",
    to: "/profile",
    icon: <FaCog size={16} />,
  },
];

export default function SidebarSudo() {
  return (
    <aside className="sidebar w-48 flex gap-2">
      <LogoText />
      <SidebarNavItems items={SUDO_NAV_ITEMS} />
    </aside>
  );
}
