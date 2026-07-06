import { type LinkProps } from '@tanstack/react-router'
import type { UserGate } from '@/features/auth/stores/auth-store'

type Team = {
  name: string
  logo: React.ElementType
  plan: string
}

type BaseNavItem = {
  title: string
  badge?: string
  icon?: React.ElementType
  /**
   * Optional function that receives the user's role names and assigned gates,
   * returns true if this nav item should be visible.
   * If omitted, the item is visible to everyone.
   */
  authorized?: (roles: string[], gates: UserGate[]) => boolean
}

type NavLink = BaseNavItem & {
  url: LinkProps['to'] | (string & {})
  items?: never
}

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: LinkProps['to'] | (string & {}) })[]
  url?: never
}

type NavItem = NavCollapsible | NavLink

type NavGroup = {
  title: string
  items: NavItem[]
}

type SidebarData = {
  teams: Team[]
  navGroups: NavGroup[]
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink }
