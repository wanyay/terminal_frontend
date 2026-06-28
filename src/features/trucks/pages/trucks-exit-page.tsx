import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { useRegisterTruckExit } from '../api/queries'

export function TrucksExitPage() {
  const [truckId, setTruckId] = useState('')
  const [exitGateId, setExitGateId] = useState('')
  const [remarks, setRemarks] = useState('')
  const { mutate, isPending } = useRegisterTruckExit()
  const { auth } = useAuthStore()
  const exitGates = auth.assignedGates.filter((g) => g.type === 'EXIT')

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold tracking-tight'>Exit Container Truck</h1>
          <p className='text-muted-foreground text-sm'>Register a container truck exit using the truck ID and exit gate.</p>
        </div>
        <Card className='mx-auto max-w-2xl'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'><LogOut className='h-5 w-5' /> Truck Exit</CardTitle>
            <CardDescription>Use this page when a truck leaves the terminal.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='truck-id'>Truck ID</Label>
              <Input id='truck-id' value={truckId} onChange={(e) => setTruckId(e.target.value)} placeholder='Truck UUID' />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='exit-gate'>Exit Gate</Label>
              <Select value={exitGateId} onValueChange={setExitGateId}>
                <SelectTrigger id='exit-gate'>
                  <SelectValue placeholder='Select exit gate' />
                </SelectTrigger>
                <SelectContent>
                  {exitGates.map((gate) => (
                    <SelectItem key={gate.id} value={gate.id}>
                      {gate.code} — {gate.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='remarks'>Remarks</Label>
              <Textarea id='remarks' rows={4} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder='Any remarks...' />
            </div>
            <div className='flex justify-end'>
              <Button onClick={() => mutate({ id: truckId, exitGateId, remarks: remarks || undefined })} disabled={isPending || !truckId || !exitGateId}>Register Exit</Button>
            </div>
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
