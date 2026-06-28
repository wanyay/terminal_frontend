import {
  LayoutDashboard,
  Truck,
  Car,
  Users,
  DoorOpen,
  UserCog,
  FileBarChart,
  ClipboardList,
  Settings,
  Command,
} from 'lucide-react'
import { type SidebarData } from '../types'

// Helper: check if user has any gate of the given type(s)
function hasGateType(gates: { type: string }[], ...types: string[]) {
  return gates.some((g) => types.includes(g.type))
}

export const sidebarData: SidebarData = {
  teams: [
    {
      name: 'TPMS',
      logo: Command,
      plan: 'Terminal Port Management',
    },
  ],
  navGroups: [
    {
      title: 'Main',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
          authorized: (roles) =>
            roles.some((r) =>
              [
                'SUPER_ADMIN',
                'SECURITY_OFFICER',
                'SUPERVISOR',
                'USER',
              ].includes(r)
            ),
        },
      ],
    },
    {
      title: 'Operations',
      items: [
        {
          title: 'Container Trucks',
          icon: Truck,
          authorized: (roles, gates) =>
            roles.some((r) =>
              ['SUPER_ADMIN', 'SECURITY_OFFICER'].includes(r)
            ) &&
            (roles.includes('SUPER_ADMIN') || gates.length > 0),
          items: [
            {
              title: 'Truck List',
              url: '/container-tuck',
              icon: Truck,
            },
            {
              title: 'Entry',
              url: '/container-tuck/entry',
              icon: Truck,
              authorized: (roles, gates) =>
                roles.includes('SUPER_ADMIN') || hasGateType(gates, 'ENTRY'),
            },
            {
              title: 'Exit',
              url: '/container-tuck/exsit',
              icon: Truck,
              authorized: (roles, gates) =>
                roles.includes('SUPER_ADMIN') || hasGateType(gates, 'EXIT'),
            },
          ],
        },
        {
          title: 'Visiting Vehicles',
          url: '/vehicles',
          icon: Car,
          authorized: (roles, gates) =>
            roles.some((r) =>
              ['SUPER_ADMIN', 'SECURITY_OFFICER'].includes(r)
            ) &&
            (roles.includes('SUPER_ADMIN') || hasGateType(gates, 'ENTRY')),
        },
        {
          title: 'Visitors',
          url: '/visitors',
          icon: Users,
          authorized: (roles, gates) =>
            roles.some((r) =>
              ['SUPER_ADMIN', 'SECURITY_OFFICER'].includes(r)
            ) &&
            (roles.includes('SUPER_ADMIN') || hasGateType(gates, 'ENTRY')),
        },
      ],
    },
    {
      title: 'Configuration',
      items: [
        {
          title: 'Gates',
          url: '/gates',
          icon: DoorOpen,
          authorized: (roles) => roles.includes('SUPER_ADMIN'),
        },
        {
          title: 'Users',
          url: '/users',
          icon: UserCog,
          authorized: (roles) => roles.includes('SUPER_ADMIN'),
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          title: 'Reports',
          url: '/reports',
          icon: FileBarChart,
          authorized: (roles) =>
            roles.some((r) => ['SUPER_ADMIN', 'SUPERVISOR'].includes(r)),
        },
        {
          title: 'Audit Logs',
          url: '/audit-logs',
          icon: ClipboardList,
          authorized: (roles) => roles.includes('SUPER_ADMIN'),
        },
        {
          title: 'Settings',
          icon: Settings,
          authorized: () => true,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
            },
          ],
        },
      ],
    },
  ],
}
