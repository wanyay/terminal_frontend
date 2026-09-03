import {
  LayoutDashboard,
  Monitor,
  DoorOpen,
  UserCog,
  FileBarChart,
  ClipboardList,
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
      name: 'Terminal Port Management System',
      logo: Command,
      plan: 'Port Operations',
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
        {
          title: 'Live Monitoring',
          url: '/live-monitoring',
          icon: Monitor,
          authorized: (roles) =>
            roles.some((r) =>
              ['SUPER_ADMIN', 'SECURITY_OFFICER', 'SUPERVISOR'].includes(r)
            ),
        },
      ],
    },
    {
      title: 'Entry Registration',
      items: [
        {
          title: 'Container Truck',
          url: '/entry-registration/container-truck',
          icon: DoorOpen,
          authorized: (roles, gates) =>
            roles.includes('SECURITY_OFFICER') && hasGateType(gates, 'ENTRY'),
        },
        {
          title: 'Visiting Vehicle',
          url: '/entry-registration/visiting-vehicle',
          icon: DoorOpen,
          authorized: (roles, gates) =>
            roles.includes('SECURITY_OFFICER') && hasGateType(gates, 'ENTRY'),
        },
        {
          title: 'Visitor',
          url: '/entry-registration/visitor',
          icon: DoorOpen,
          authorized: (roles, gates) =>
            roles.includes('SECURITY_OFFICER') && hasGateType(gates, 'ENTRY'),
        },
      ],
    },
    {
      title: 'Exit Registration',
      items: [
        {
          title: 'Container Truck',
          url: '/exit-registration/container-truck',
          icon: DoorOpen,
          authorized: (roles, gates) =>
            roles.includes('SECURITY_OFFICER') && hasGateType(gates, 'EXIT'),
        },
        {
          title: 'Visiting Vehicle',
          url: '/exit-registration/visiting-vehicle',
          icon: DoorOpen,
          authorized: (roles, gates) =>
            roles.includes('SECURITY_OFFICER') && hasGateType(gates, 'EXIT'),
        },
        {
          title: 'Visitor',
          url: '/exit-registration/visitor',
          icon: DoorOpen,
          authorized: (roles, gates) =>
            roles.includes('SECURITY_OFFICER') && hasGateType(gates, 'EXIT'),
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
          icon: FileBarChart,
          authorized: (roles) =>
            roles.some((r) => ['SUPER_ADMIN', 'SUPERVISOR'].includes(r)),
          items: [
            {
              title: 'Container Trucks',
              url: '/reports/trucks',
              authorized: (roles) =>
                roles.some((r) => ['SUPER_ADMIN', 'SUPERVISOR'].includes(r)),
            },
            {
              title: 'Visiting Vehicles',
              url: '/reports/vehicles',
              authorized: (roles) =>
                roles.some((r) => ['SUPER_ADMIN', 'SUPERVISOR'].includes(r)),
            },
            {
              title: 'Visitors',
              url: '/reports/visitors',
              authorized: (roles) =>
                roles.some((r) => ['SUPER_ADMIN', 'SUPERVISOR'].includes(r)),
            },
          ],
        },
        {
          title: 'Blacklist',
          url: '/blacklist',
          icon: ClipboardList,
          authorized: (roles) => roles.some((r) => ['SUPER_ADMIN', 'SUPERVISOR'].includes(r)),
        },
      ],
    },
  ],
}
