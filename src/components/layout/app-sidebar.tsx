import { useMemo } from 'react'
import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import type { NavItem } from './types'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { auth } = useAuthStore()
  const userRoles = auth.roleNames
  const userGates = auth.assignedGates

  const filteredNavGroups = useMemo(() => {
    function itemIsAuthorized(item: NavItem): boolean {
      if (item.authorized && !item.authorized(userRoles, userGates)) return false
      if ('items' in item && item.items) {
        return item.items.some((sub) => {
          if ('authorized' in sub && sub.authorized) {
            return sub.authorized(userRoles, userGates)
          }
          return true
        })
      }
      return true
    }

    return sidebarData.navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(itemIsAuthorized),
      }))
      .filter((group) => group.items.length > 0)
  }, [userRoles, userGates])

  const fullName = [auth.user?.firstName, auth.user?.lastName]
    .filter(Boolean)
    .join(' ')
  const email = auth.user?.email ?? ''

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <AppTitle />
      </SidebarHeader>
      <SidebarContent>
        {filteredNavGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: fullName || auth.user?.username || 'User',
            email,
            avatar: '',
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
