import {
  FaHome,
  FaFile,
  FaCog,
  FaUser,
  FaCalendar,
  FaMedkit,
  FaUserFriends,
} from "react-icons/fa";

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
