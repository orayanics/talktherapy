import {
  FaCalendar,
  FaCog,
  FaFile,
  FaHome,
  FaMedkit,
  FaUser,
} from 'react-icons/fa'
import type { ACCOUNT_ROLE } from '~/models/account'
import type { NavItem } from '~/models/components'

export type { NavItem }

export const SUDO_NAV_ITEMS = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: <FaHome size={16} />,
  },
  {
    label: 'Users',
    to: '/users',
    icon: <FaUser size={16} />,
  },
  {
    label: 'Logs',
    to: '/logs',
    icon: <FaFile size={16} />,
  },
  {
    label: 'Profile',
    to: '/profile',
    icon: <FaCog size={16} />,
  },
]

export const ADMIN_NAV_ITEMS = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: <FaHome size={16} />,
  },
  {
    label: 'Users',
    to: '/users',
    icon: <FaUser size={16} />,
  },
  {
    label: 'Content',
    to: '/content',
    icon: <FaFile size={16} />,
  },
  {
    label: 'Schedules',
    to: '/schedules',
    icon: <FaCalendar size={16} />,
  },
  {
    label: 'Profile',
    to: '/profile',
    icon: <FaCog size={16} />,
  },
]

export const CLINICIAN_NAV_ITEMS = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: <FaHome size={16} />,
  },
  {
    label: 'Patients',
    to: '/patients',
    icon: <FaUser size={16} />,
  },
  {
    label: 'Content',
    to: '/content',
    icon: <FaFile size={16} />,
  },
  {
    label: 'Schedules',
    to: '/schedules',
    icon: <FaCalendar size={16} />,
  },
  {
    label: 'Profile',
    to: '/profile',
    icon: <FaCog size={16} />,
  },
]

export const PATIENT_NAV_ITEMS = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: <FaHome size={16} />,
  },
  {
    label: 'Appointments',
    to: '/appointments',
    icon: <FaUser size={16} />,
  },
  {
    label: 'My Appointments',
    to: '/my-appointments',
    icon: <FaCalendar size={16} />,
  },
  {
    label: 'Records',
    to: '/records',
    icon: <FaMedkit size={16} />,
  },
  {
    label: 'Content',
    to: '/content',
    icon: <FaFile size={16} />,
  },
  {
    label: 'Profile',
    to: '/profile',
    icon: <FaCog size={16} />,
  },
]

export const NAV_BY_ROLE: Record<ACCOUNT_ROLE, Array<NavItem>> = {
  sudo: SUDO_NAV_ITEMS,
  admin: ADMIN_NAV_ITEMS,
  clinician: CLINICIAN_NAV_ITEMS,
  patient: PATIENT_NAV_ITEMS,
}
