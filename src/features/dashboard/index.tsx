import { useMemo } from 'react'
import {
  Car,
  DoorOpen,
  LayoutDashboard,
  Truck,
  UserRound,
  UserRoundCheck,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemeSwitch } from '@/components/theme-switch'
import { useDashboard } from './api/queries'
import { format } from 'date-fns'

const toneStyles = {
  neutral: {
    card: 'border-border bg-card',
    icon: 'bg-muted text-foreground',
    value: 'text-foreground',
    soft: 'bg-muted text-foreground',
  },
} as const

type ToneName = keyof typeof toneStyles

const activityIcons: Record<string, LucideIcon> = {
  truck: Truck,
  vehicle: Car,
  visitor: UserRound,
}

export function Dashboard() {
  const { data, isLoading, isError } = useDashboard()

  const summaryCards = useMemo(() => {
    const s = data?.summary
    if (!s) return []
    return [
      { title: "Today's Truck Entries", value: s.todayTruckEntries, icon: Truck },
      { title: "Today's Truck Exits", value: s.todayTruckExits, icon: Truck },
      { title: "Today's Vehicle Entries", value: s.todayVehicleEntries, icon: Car },
      { title: "Today's Vehicle Exits", value: s.todayVehicleExits, icon: Car },
      { title: "Today's Visitor Entries", value: s.todayVisitorEntries, icon: UserRoundCheck },
      { title: "Today's Visitor Exits", value: s.todayVisitorExits, icon: UserRoundCheck },
    ]
  }, [data])

  const insideCards = useMemo(() => {
    const i = data?.inside
    if (!i) return []
    return [
      { title: 'Active Trucks Inside', value: i.activeTrucks, description: 'Currently inside the terminal', icon: Truck },
      { title: 'Active Vehicles Inside', value: i.activeVehicles, description: 'Currently inside the terminal', icon: Car },
      { title: 'Active Visitors Inside', value: i.activeVisitors, description: 'Currently inside the terminal', icon: UsersRound },
    ]
  }, [data])

  const gates = useMemo(() => data?.gateUsage ?? [], [data])
  const recentActivities = data?.recentActivities ?? []

  const totalEntries = useMemo(
    () => gates.reduce((t, g) => t + g.entries, 0),
    [gates]
  )
  const totalExits = useMemo(
    () => gates.reduce((t, g) => t + g.exits, 0),
    [gates]
  )
  const maxGateMovement = useMemo(
    () => Math.max(1, ...gates.flatMap((g) => [g.entries, g.exits])),
    [gates]
  )

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fluid className='px-4 py-5 lg:px-6'>
        <div className='mb-5'>
          <div className='flex items-center gap-2'>
            <LayoutDashboard className='size-6' />
            <h1 className='text-2xl font-bold tracking-normal'>Dashboard</h1>
          </div>
          <p className='text-muted-foreground mt-1 text-sm'>
            Overview of today's terminal activities
          </p>
        </div>

        {isError ? (
          <div className='flex items-center justify-center py-12'>
            <p className='text-destructive text-sm'>Failed to load dashboard data. Please try again.</p>
          </div>
        ) : (
          <>
            <section className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className='rounded-lg py-4'>
                    <CardContent className='flex items-center gap-4 px-4'>
                      <Skeleton className='size-18 rounded-xl' />
                      <div className='min-w-0 space-y-2'>
                        <Skeleton className='h-4 w-28' />
                        <Skeleton className='h-10 w-16' />
                        <Skeleton className='h-3 w-20' />
                      </div>
                    </CardContent>
                  </Card>
                ))
                : summaryCards.map((item) => (
                  <MetricCard
                    key={item.title}
                    title={item.title}
                    value={String(item.value)}
                    icon={item.icon}
                    tone='neutral'
                  />
                ))}
            </section>

            <section className='mt-4 grid gap-4 lg:grid-cols-3'>
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className='rounded-lg py-4'>
                    <CardContent className='flex items-center gap-5 px-4'>
                      <Skeleton className='size-18.5 rounded-xl' />
                      <div className='space-y-2'>
                        <Skeleton className='h-4 w-36' />
                        <Skeleton className='h-10 w-16' />
                        <Skeleton className='h-3 w-24' />
                      </div>
                    </CardContent>
                  </Card>
                ))
                : insideCards.map((item) => (
                  <InsideCard key={item.title} {...item} tone='neutral' />
                ))}
            </section>

            <section className='mt-4 grid gap-4'>
              <Card className='rounded-lg py-4'>
                <CardHeader className='px-4 pb-1'>
                  <div className='flex items-center justify-between gap-3'>
                    <CardTitle className='text-base'>Gate Usage Today</CardTitle>
                    <div className='text-muted-foreground flex items-center gap-5 text-xs font-medium'>
                      <span className='flex items-center gap-1.5'>
                        <span className='bg-foreground size-2.5 rounded-sm' />
                        Entries
                      </span>
                      <span className='flex items-center gap-1.5'>
                        <span className='bg-muted-foreground size-2.5 rounded-sm' />
                        Exits
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='px-4'>
                  {isLoading ? (
                    <div className='space-y-2'>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className='h-8 w-full' />
                      ))}
                    </div>
                  ) : (
                    <div className='overflow-x-auto'>
                      <div className='min-w-162.5'>
                        <div className='text-muted-foreground grid grid-cols-[120px_130px_130px_1fr] border-b py-2 text-xs font-semibold'>
                          <span>Gate</span>
                          <span>Today's Entries</span>
                          <span>Today's Exits</span>
                          <span />
                        </div>
                        {gates.length === 0 ? (
                          <div className='py-8 text-center text-muted-foreground text-sm'>
                            No gate data available.
                          </div>
                        ) : (
                          gates.map((gate) => (
                            <div
                              key={gate.gateId}
                              className='grid grid-cols-[120px_130px_130px_1fr] items-center border-b py-2 text-sm last:border-b-0'
                            >
                              <span className='text-foreground/80'>{gate.gateName}</span>
                              <span className='text-foreground font-semibold'>{gate.entries}</span>
                              <span className='text-muted-foreground font-semibold'>{gate.exits}</span>
                              <div className='space-y-2'>
                                <ProgressBar value={(gate.entries / maxGateMovement) * 100} className='bg-foreground' />
                                <ProgressBar value={(gate.exits / maxGateMovement) * 100} className='bg-muted-foreground' />
                              </div>
                            </div>
                          ))
                        )}
                        <div className='dark:bg-muted/40 grid grid-cols-[120px_130px_130px_1fr] rounded-b-md bg-slate-100 py-2 text-sm font-semibold'>
                          <span className='text-foreground/80 flex items-center gap-2'>
                            <DoorOpen className='size-4' />
                            Total
                          </span>
                          <span className='text-foreground'>{totalEntries}</span>
                          <span className='text-muted-foreground'>{totalExits}</span>
                          <span className='text-muted-foreground'>(All Gates)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            <section className='mt-4 grid gap-4'>
              <Card className='rounded-lg py-4'>
                <CardHeader className='px-4 pb-0'>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-base'>Recent Activities</CardTitle>
                    <Button variant='outline' size='sm' className='h-8'>
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='px-4'>
                  {isLoading ? (
                    <div className='space-y-2'>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className='h-8 w-full' />
                      ))}
                    </div>
                  ) : (
                    <div className='overflow-x-auto'>
                      <table className='w-full min-w-115 text-sm'>
                        <thead>
                          <tr className='text-muted-foreground border-b text-left text-xs font-semibold'>
                            <th className='py-2'>Time</th>
                            <th>Type</th>
                            <th>Number / Name</th>
                            <th>Gate</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentActivities.length === 0 ? (
                            <tr>
                              <td colSpan={5} className='py-8 text-center text-muted-foreground text-sm'>
                                No recent activities.
                              </td>
                            </tr>
                          ) : (
                            recentActivities.map((activity) => {
                              const Icon = activityIcons[activity.type] ?? UserRound
                              const entered = activity.status === 'ENTERED'

                              return (
                                <tr key={activity.id} className='border-b'>
                                  <td className='text-foreground/80 py-2'>
                                    {format(new Date(activity.timestamp), 'hh:mm a')}
                                  </td>
                                  <td>
                                    <span className='flex items-center gap-1.5'>
                                      <Icon
                                        className={cn(
                                          'size-3.5',
                                          entered ? 'text-foreground' : 'text-muted-foreground'
                                        )}
                                      />
                                      {activity.type}
                                    </span>
                                  </td>
                                  <td className='text-foreground font-medium'>{activity.name}</td>
                                  <td className='text-foreground/80'>{activity.gateName}</td>
                                  <td>
                                    <Badge
                                      className={cn(
                                        'border-transparent text-[10px]',
                                        entered
                                          ? 'bg-foreground text-background'
                                          : 'bg-muted text-muted-foreground'
                                      )}
                                    >
                                      {activity.status}
                                    </Badge>
                                  </td>
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </Main>
    </>
  )
}

function MetricCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string
  value: string
  icon: LucideIcon
  tone: ToneName
}) {
  const styles = toneStyles[tone]

  return (
    <Card className={cn('rounded-lg py-4', styles.card)}>
      <CardContent className='flex items-center gap-4 px-4'>
        <div
          className={cn(
            'flex size-18 shrink-0 items-center justify-center rounded-xl',
            styles.icon
          )}
        >
          <Icon className='size-9' />
        </div>
        <div className='min-w-0'>
          <h2 className='text-foreground text-sm leading-6 font-bold'>{title}</h2>
          <div className={cn('mt-1 text-4xl leading-none font-bold', styles.value)}>
            {value}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function InsideCard({
  title,
  value,
  description,
  icon: Icon,
  tone,
}: {
  title: string
  value: number
  description: string
  icon: LucideIcon
  tone: ToneName
}) {
  const styles = toneStyles[tone]

  return (
    <Card className={cn('rounded-lg py-4', styles.card)}>
      <CardContent className='flex items-center gap-5 px-4'>
        <div
          className={cn(
            'flex size-18.5 shrink-0 items-center justify-center rounded-xl',
            styles.icon
          )}
        >
          <Icon className='size-9' />
        </div>
        <div>
          <h2 className='text-base font-bold'>{title}</h2>
          <div className={cn('mt-2 text-4xl leading-none font-bold', styles.value)}>
            {value}
          </div>
          <p className='mt-2 text-sm'>{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function ProgressBar({ value, className }: { value: number; className: string }) {
  return (
    <div className='dark:bg-muted h-2 overflow-hidden rounded-full bg-slate-100'>
      <div className={cn('h-full rounded-full', className)} style={{ width: `${value}%` }} />
    </div>
  )
}
