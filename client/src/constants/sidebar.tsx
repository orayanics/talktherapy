import {
  Calendar,
  Clapperboard,
  ClipboardClock,
  ClipboardPlus,
  LayoutDashboard,
  Logs,
  Settings,
  User,
} from 'lucide-react'

import type { USER_ROLE } from '@/types/account'
import type { NavItem } from '@/types/component'

export const superadmin_NAV_ITEMS = [
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

export const CLINICIAN_NAV_ITEMS = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: <LayoutDashboard size={16} />,
  },
  {
    label: 'Schedules',
    to: '/schedules',
    icon: <Calendar size={16} />,
  },
  {
    label: 'Appointments',
    to: '/appointments',
    icon: <ClipboardClock size={16} />,
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
    label: 'Book',
    to: '/book',
    icon: <Calendar size={16} />,
  },
  {
    label: 'Appointments',
    to: '/appointments',
    icon: <ClipboardClock size={16} />,
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

export const NAV_BY_ROLE: Record<USER_ROLE, Array<NavItem>> = {
  superadmin: superadmin_NAV_ITEMS,
  admin: ADMIN_NAV_ITEMS,
  clinician: CLINICIAN_NAV_ITEMS,
  patient: PATIENT_NAV_ITEMS,
}
