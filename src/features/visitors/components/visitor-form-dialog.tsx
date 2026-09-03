import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import {
  useRegisterEntry,
  useUpdateVisitor,
  type Visitor,
} from '../api/queries'

const entrySchema = z.object({
  visitorName: z.string().min(1, 'Visitor name is required').max(100),
  nrcOrPassport: z.string().max(50).optional().or(z.literal('')),
  phoneNumber: z.string().max(20).optional().or(z.literal('')),
  companyName: z.string().max(100).optional().or(z.literal('')),
  purposeOfVisit: z.string().max(255).optional().or(z.literal('')),
  hostEmployee: z.string().max(100).optional().or(z.literal('')),
  entryGateId: z.string().min(1, 'Entry gate is required'),
  remarks: z.string().max(500).optional().or(z.literal('')),
})

const editSchema = z.object({
  visitorName: z.string().min(1, 'Visitor name is required').max(100),
  nrcOrPassport: z.string().max(50).optional().or(z.literal('')),
  phoneNumber: z.string().max(20).optional().or(z.literal('')),
  companyName: z.string().max(100).optional().or(z.literal('')),
  purposeOfVisit: z.string().max(255).optional().or(z.literal('')),
  hostEmployee: z.string().max(100).optional().or(z.literal('')),
  remarks: z.string().max(500).optional().or(z.literal('')),
})

type EntryFormValues = z.infer<typeof entrySchema>
type EditFormValues = z.infer<typeof editSchema>

interface VisitorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  visitor?: Visitor | null
}

export function VisitorFormDialog({
  open,
  onOpenChange,
  visitor,
}: VisitorFormDialogProps) {
  const isEditing = !!visitor
  const { mutate: registerEntry, isPending: isRegistering } = useRegisterEntry()
  const { mutate: updateVisitor, isPending: isUpdating } = useUpdateVisitor(
    visitor?.id ?? '',
  )
  const isPending = isRegistering || isUpdating

  const { auth } = useAuthStore()
  const entryGates = auth.assignedGates.filter((g) => g.type === 'ENTRY')

  const entryForm = useForm<EntryFormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      visitorName: '',
      nrcOrPassport: '',
      phoneNumber: '',
      companyName: '',
      purposeOfVisit: '',
      hostEmployee: '',
      entryGateId: '',
      remarks: '',
    },
  })

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      visitorName: visitor?.visitorName ?? '',
      nrcOrPassport: visitor?.nrcOrPassport ?? '',
      phoneNumber: visitor?.phoneNumber ?? '',
      companyName: visitor?.companyName ?? '',
      purposeOfVisit: visitor?.purposeOfVisit ?? '',
      hostEmployee: visitor?.hostEmployee ?? '',
      remarks: visitor?.remarks ?? '',
    },
  })

  useEffect(() => {
    if (isEditing && visitor) {
      editForm.reset({
        visitorName: visitor.visitorName,
        nrcOrPassport: visitor.nrcOrPassport ?? '',
        phoneNumber: visitor.phoneNumber ?? '',
        companyName: visitor.companyName ?? '',
        purposeOfVisit: visitor.purposeOfVisit ?? '',
        hostEmployee: visitor.hostEmployee ?? '',
        remarks: visitor.remarks ?? '',
      })
    }
  }, [visitor, isEditing, editForm])

  function onRegister(data: EntryFormValues) {
    registerEntry(
      {
        ...data,
        nrcOrPassport: data.nrcOrPassport || undefined,
        phoneNumber: data.phoneNumber || undefined,
        companyName: data.companyName || undefined,
        purposeOfVisit: data.purposeOfVisit || undefined,
        hostEmployee: data.hostEmployee || undefined,
        remarks: data.remarks || undefined,
      },
      {
        onSuccess: () => {
          entryForm.reset()
          onOpenChange(false)
        },
      },
    )
  }

  function onEditSubmit(data: EditFormValues) {
    if (!visitor) return
    updateVisitor(
      {
        ...data,
        nrcOrPassport: data.nrcOrPassport || undefined,
        phoneNumber: data.phoneNumber || undefined,
        companyName: data.companyName || undefined,
        purposeOfVisit: data.purposeOfVisit || undefined,
        hostEmployee: data.hostEmployee || undefined,
        remarks: data.remarks || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      },
    )
  }

  const gateField = (
    <FormField
      control={entryForm.control}
      name='entryGateId'
      render={({ field }) => (
        <FormItem>
          <FormLabel>Entry Gate</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder='Select entry gate' />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {entryGates.map((gate) => (
                <SelectItem key={gate.id} value={gate.id}>
                  {gate.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )

  const renderCommonFields = (
    form: typeof entryForm | typeof editForm,
  ) => (
    <>
      <FormField
        control={form.control as any}
        name='visitorName'
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Visitor Name</FormLabel>
            <FormControl>
              <Input placeholder='John Doe' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className='grid grid-cols-2 gap-4'>
        <FormField
          control={form.control as any}
          name='nrcOrPassport'
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>NRC / Passport</FormLabel>
              <FormControl>
                <Input placeholder='12/AB123456' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control as any}
          name='phoneNumber'
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder='09...' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <FormField
          control={form.control as any}
          name='companyName'
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder='ABC Corp' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control as any}
          name='hostEmployee'
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>Host Employee</FormLabel>
              <FormControl>
                <Input placeholder='Jane Smith' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control as any}
        name='purposeOfVisit'
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Purpose of Visit</FormLabel>
            <FormControl>
              <Input placeholder='Meeting, Delivery, etc.' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control as any}
        name='remarks'
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Remarks</FormLabel>
            <FormControl>
              <Textarea
                placeholder='Optional remarks...'
                className='resize-none'
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-137.5'>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Visitor' : 'Register Visitor Entry'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the visitor details.'
              : 'Register a new visitor and their entry to the port.'}
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className='space-y-4'
            >
              {renderCommonFields(editForm as any)}
              <div className='flex justify-end gap-3 pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={isPending}>
                  {isPending && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  Update Visitor
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...entryForm}>
            <form
              onSubmit={entryForm.handleSubmit(onRegister)}
              className='space-y-4'
            >
              {renderCommonFields(entryForm as any)}
              {gateField}
              <div className='flex justify-end gap-3 pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={isPending}>
                  {isPending && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  Register Entry
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
