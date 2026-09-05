import { type LinkProps } from '@tanstack/react-router'
import type { UserGate } from '@/features/auth/stores/auth-store'

type Team = {
  nameKey: string
  logo: React.ElementType
  planKey: string
}

type BaseNavItem = {
  /**
   * Key into the i18n translation dictionary (resolved via useTranslation)
   */
  titleKey: string
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
  titleKey: string
  items: NavItem[]
}

type SidebarData = {
  teams: Team[]
  navGroups: NavGroup[]
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink }
