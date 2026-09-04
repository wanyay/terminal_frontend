import {
  LayoutDashboard,
  Monitor,
  DoorOpen,
  UserCog,
  FileBarChart,
  ClipboardList,
  ScrollText,
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
      nameKey: 'app.name',
      logo: Command,
      planKey: 'app.plan',
    },
  ],
  navGroups: [
    {
      titleKey: 'nav.main',
      items: [
        {
          titleKey: 'nav.dashboard',
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
          titleKey: 'nav.liveMonitoring',
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
      titleKey: 'nav.entryRegistration',
      items: [
        {
          titleKey: 'nav.containerTruck',
          url: '/entry-registration/container-truck',
          icon: DoorOpen,
          authorized: (roles, gates) =>
            roles.includes('SECURITY_OFFICER') && hasGateType(gates, 'ENTRY'),
        },
        {
          titleKey: 'nav.visitingVehicle',
          url: '/entry-registration/visiting-vehicle',
          icon: DoorOpen,
          authorized: (roles, gates) =>
            roles.includes('SECURITY_OFFICER') && hasGateType(gates, 'ENTRY'),
        },
        {
          titleKey: 'nav.visitor',
          url: '/entry-registration/visitor',
          icon: DoorOpen,
          authorized: (roles, gates) =>
            roles.includes('SECURITY_OFFICER') && hasGateType(gates, 'ENTRY'),
        },
      ],
    },
    {
      titleKey: 'nav.exitRegistration',
      items: [
        {
          titleKey: 'nav.containerTruck',
          url: '/exit-registration/container-truck',
          icon: DoorOpen,
          authorized: (roles, gates) =>
            roles.includes('SECURITY_OFFICER') && hasGateType(gates, 'EXIT'),
        },
        {
          titleKey: 'nav.visitingVehicle',
          url: '/exit-registration/visiting-vehicle',
          icon: DoorOpen,
          authorized: (roles, gates) =>
            roles.includes('SECURITY_OFFICER') && hasGateType(gates, 'EXIT'),
        },
        {
          titleKey: 'nav.visitor',
          url: '/exit-registration/visitor',
          icon: DoorOpen,
          authorized: (roles, gates) =>
            roles.includes('SECURITY_OFFICER') && hasGateType(gates, 'EXIT'),
        },
      ],
    },
    {
      titleKey: 'nav.configuration',
      items: [
        {
          titleKey: 'nav.gates',
          url: '/gates',
          icon: DoorOpen,
          authorized: (roles) => roles.includes('SUPER_ADMIN'),
        },
        {
          titleKey: 'nav.users',
          url: '/users',
          icon: UserCog,
          authorized: (roles) => roles.includes('SUPER_ADMIN'),
        },
      ],
    },
    {
      titleKey: 'nav.system',
      items: [
        {
          titleKey: 'nav.reports',
          icon: FileBarChart,
          authorized: (roles) =>
            roles.some((r) => ['SUPER_ADMIN', 'SUPERVISOR'].includes(r)),
          items: [
            {
              titleKey: 'nav.containerTrucks',
              url: '/reports/trucks',
              authorized: (roles) =>
                roles.some((r) => ['SUPER_ADMIN', 'SUPERVISOR'].includes(r)),
            },
            {
              titleKey: 'nav.visitingVehicles',
              url: '/reports/vehicles',
              authorized: (roles) =>
                roles.some((r) => ['SUPER_ADMIN', 'SUPERVISOR'].includes(r)),
            },
            {
              titleKey: 'nav.visitors',
              url: '/reports/visitors',
              authorized: (roles) =>
                roles.some((r) => ['SUPER_ADMIN', 'SUPERVISOR'].includes(r)),
            },
          ],
        },
        {
          titleKey: 'nav.blacklist',
          url: '/blacklist',
          icon: ClipboardList,
          authorized: (roles) =>
            roles.some((r) => ['SUPER_ADMIN', 'SUPERVISOR'].includes(r)),
        },
        {
          titleKey: 'nav.auditLogs',
          url: '/audit-logs',
          icon: ScrollText,
          authorized: (roles) =>
            roles.some((r) => ['SUPER_ADMIN', 'SUPERVISOR'].includes(r)),
        },
      ],
    },
  ],
}
