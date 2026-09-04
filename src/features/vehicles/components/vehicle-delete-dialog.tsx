import { Loader2 } from 'lucide-react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useTranslation } from '@/context/language-provider'
import { useDeleteVehicle, type Vehicle } from '../api/queries'

interface Props { open: boolean; onOpenChange: (open: boolean) => void; vehicle: Vehicle | null }

export function VehicleDeleteDialog({ open, onOpenChange, vehicle }: Props) {
  const { mutate: del, isPending } = useDeleteVehicle()
  const { t } = useTranslation()
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='sm:max-w-[425px]'>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('vehicles.deleteVehicle' as never)}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('vehicles.deleteVehicleConfirm' as never, { plate: vehicle?.plateNumber ?? '', name: vehicle?.visitorName ?? '' })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{t('common.cancel' as never)}</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => { e.preventDefault(); if (vehicle) del(vehicle.id, { onSuccess: () => onOpenChange(false) }) }} disabled={isPending} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}{t('common.delete' as never)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
