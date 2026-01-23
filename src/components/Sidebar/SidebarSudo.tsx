import React from "react";
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

export default function SidebarSudo({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <aside className="drawer lg:drawer-open">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-center">
        <div className="bg-base-100 border-b w-full">
          <label htmlFor="my-drawer-3" className="btn btn-primary lg:hidden">
            Open drawer
          </label>
        </div>
        {children}
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-3"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="menu bg-base-100 border-r min-h-full w-64 gap-2 p-0">
          <LogoText />
          <SidebarNavItems items={SUDO_NAV_ITEMS} />
        </div>
      </div>
    </aside>
  );
}
