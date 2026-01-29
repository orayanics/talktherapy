import React from "react";
import { NAV_BY_ROLE } from "~/config/sidebar";
import { UserType } from "~/models/user";
import { FaBars } from "react-icons/fa";

import LogoText from "~/components/Logo/LogoText";
import SidebarNavItems from "./SidebarNavItems";

interface SidebarProps {
  children: React.ReactNode;
  role: UserType;
}

export default function Sidebar(props: SidebarProps) {
  const { children, role } = props;
  const navItems = NAV_BY_ROLE[role] ?? [];

  return (
    <aside className="drawer lg:drawer-open">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-center">
        <div className="bg-base-100 border-b w-full">
          <label
            htmlFor="my-drawer-3"
            className="btn btn-primary m-4 lg:hidden"
          >
            <FaBars />
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
          <SidebarNavItems items={navItems} />
        </div>
      </div>
    </aside>
  );
}
