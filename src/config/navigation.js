import {
  BarChart3,
  Bell,
  Bookmark,
  ClipboardCheck,
  FileWarning,
  Handshake,
  LayoutDashboard,
  ListChecks,
  Mail,
  MapPinned,
  MessageCircle,
  PackageSearch,
  PlusCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  Tags,
  UserCog,
  UserRound,
  UsersRound,
} from 'lucide-react'

export const studentNavigation = [
  ['Overview', '/dashboard', LayoutDashboard],
  ['Report lost', '/report/lost', PlusCircle],
  ['Report found', '/report/found', PlusCircle],
  ['My listings', '/my-listings', ListChecks],
  ['Possible matches', '/matches', Sparkles],
  ['My claims', '/claims', ClipboardCheck],
  ['Saved items', '/saved', Bookmark],
  ['Chats', '/chats', MessageCircle],
  ['Notifications', '/notifications', Bell],
  ['Profile', '/profile', UserRound],
]

export const staffNavigation = [
  ['Staff overview', '/staff', LayoutDashboard],
  ['Security items', '/staff/security-items', ShieldCheck],
  ['Claim verification', '/staff/claims', ClipboardCheck],
  ['Pending handovers', '/staff/handovers', Handshake],
  ['Handover records', '/staff/records', ListChecks],
  ['Chats', '/chats', MessageCircle],
  ['Profile', '/profile', UserRound],
]

export const adminNavigation = [
  ['Admin overview', '/admin', LayoutDashboard],
  ['Users', '/admin/users', UsersRound],
  ['Staff', '/admin/staff', UserCog],
  ['Listings', '/admin/listings', PackageSearch],
  ['Claims', '/admin/claims', Handshake],
  ['Complaints', '/admin/complaints', FileWarning],
  ['Categories', '/admin/categories', Tags],
  ['Locations', '/admin/locations', MapPinned],
  ['Support inbox', '/admin/contact-messages', Mail],
  ['Announcements', '/admin/announcements', Bell],
  ['Analytics', '/admin/analytics', BarChart3],
  ['Reports', '/admin/reports', BarChart3],
  ['Activity logs', '/admin/logs', ListChecks],
  ['Settings', '/admin/settings', Settings],
]

export function getWorkspaceNavigation(role) {
  if (role === 'admin') return adminNavigation
  if (role === 'staff') return staffNavigation
  return studentNavigation
}

export function getWorkspaceHome(role) {
  if (role === 'admin') return '/admin'
  if (role === 'staff') return '/staff'
  return '/dashboard'
}
