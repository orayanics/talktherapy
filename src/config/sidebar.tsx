import {
  FaHome,
  FaFile,
  FaCog,
  FaUser,
  FaCalendar,
  FaMedkit,
  FaUserFriends,
} from "react-icons/fa";
import { UserType } from "~/models/user/user";

export interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

export const SUDO_NAV_ITEMS = [
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

export const ADMIN_NAV_ITEMS = [
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
    label: "Content",
    to: "/content",
    icon: <FaFile size={16} />,
  },
  {
    label: "Schedules",
    to: "/schedules",
    icon: <FaCalendar size={16} />,
  },
  {
    label: "Profile",
    to: "/profile",
    icon: <FaCog size={16} />,
  },
];

export const CLINICIAN_NAV_ITEMS = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: <FaHome size={16} />,
  },
  {
    label: "Patients",
    to: "/patients",
    icon: <FaUser size={16} />,
  },
  {
    label: "Content",
    to: "/content",
    icon: <FaFile size={16} />,
  },
  {
    label: "Schedules",
    to: "/schedules",
    icon: <FaCalendar size={16} />,
  },
  {
    label: "Profile",
    to: "/profile",
    icon: <FaCog size={16} />,
  },
];

export const PATIENT_NAV_ITEMS = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: <FaHome size={16} />,
  },
  {
    label: "Appointments",
    to: "/appointments",
    icon: <FaUser size={16} />,
  },
  {
    label: "Records",
    to: "/records",
    icon: <FaMedkit size={16} />,
  },
  {
    label: "Content",
    to: "/content",
    icon: <FaFile size={16} />,
  },
  {
    label: "Profile",
    to: "/profile",
    icon: <FaCog size={16} />,
  },
];

export const NAV_BY_ROLE: Record<UserType, NavItem[]> = {
  sudo: SUDO_NAV_ITEMS,
  admin: ADMIN_NAV_ITEMS,
  clinician: CLINICIAN_NAV_ITEMS,
  patient: PATIENT_NAV_ITEMS,
};
