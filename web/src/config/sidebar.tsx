import {
  Calendar,
  Clapperboard,
  ClipboardPlus,
  LayoutDashboard,
  Logs,
  Settings,
  User,
} from 'lucide-react'
import type { ACCOUNT_ROLE } from '~/models/account'
import type { NavItem } from '~/models/components'

export type { NavItem }

export const SUDO_NAV_ITEMS = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: <LayoutDashboard size={16} />,
  },
  {
    label: 'Users',
    to: '/users',
    icon: <User size={16} />,
  },
  {
    label: 'Content',
    to: '/content',
    icon: <Clapperboard size={16} />,
  },
  {
    label: 'Logs',
    to: '/logs',
    icon: <Logs size={16} />,
  },
  {
    label: 'Profile',
    to: '/profile',
    icon: <Settings size={16} />,
  },
]

export const ADMIN_NAV_ITEMS = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: <LayoutDashboard size={16} />,
  },
  {
    label: 'Users',
    to: '/users',
    icon: <User size={16} />,
  },
  {
    label: 'Content',
    to: '/content',
    icon: <Clapperboard size={16} />,
  },
  {
    label: 'Schedules',
    to: '/schedules',
    icon: <Calendar size={16} />,
  },
  {
    label: 'Profile',
    to: '/profile',
    icon: <Settings size={16} />,
  },
]

export const CLINICIAN_NAV_ITEMS = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: <LayoutDashboard size={16} />,
  },
  {
    label: 'Patients',
    to: '/patients',
    icon: <User size={16} />,
  },
  {
    label: 'Content',
    to: '/content',
    icon: <Clapperboard size={16} />,
  },
  {
    label: 'Schedules',
    to: '/schedules',
    icon: <Calendar size={16} />,
  },
  {
    label: 'Profile',
    to: '/profile',
    icon: <Settings size={16} />,
  },
]

export const PATIENT_NAV_ITEMS = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: <LayoutDashboard size={16} />,
  },
  {
    label: 'Appointments',
    to: '/appointments',
    icon: <Calendar size={16} />,
  },
  {
    label: 'Records',
    to: '/records',
    icon: <ClipboardPlus size={16} />,
  },
  {
    label: 'Content',
    to: '/content',
    icon: <Clapperboard size={16} />,
  },
  {
    label: 'Profile',
    to: '/profile',
    icon: <Settings size={16} />,
  },
]

export const NAV_BY_ROLE: Record<ACCOUNT_ROLE, Array<NavItem>> = {
  sudo: SUDO_NAV_ITEMS,
  admin: ADMIN_NAV_ITEMS,
  clinician: CLINICIAN_NAV_ITEMS,
  patient: PATIENT_NAV_ITEMS,
}
