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
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useCreateUser,
  useUpdateUser,
  getRoleOptions,
  type User,
  type CreateUserPayload,
  type UpdateUserPayload,
} from '../api/queries'
import { useGates } from '@/features/gates/api/queries'
import { useTranslation } from '@/context/language-provider'
import type { TranslationKey } from '@/lib/i18n'

type CreateFormValues = z.infer<ReturnType<typeof buildCreateSchema>>
type EditFormValues = z.infer<ReturnType<typeof buildEditSchema>>

function buildCreateSchema(t: (key: TranslationKey, params?: Record<string, string | number>) => string) {
  return z.object({
    username: z
      .string()
      .min(3, t('users.usernameMin' as never))
      .max(50, t('users.usernameMax' as never)),
    password: z
      .string()
      .min(6, t('users.passwordMin6' as never))
      .max(100),
    fullName: z
      .string()
      .min(1, t('users.fullNameRequired' as never))
      .max(100),
    email: z
      .string()
      .optional(),
    role: z.string().min(1, t('users.roleRequired' as never)),
    assignedGateId: z.string().optional(),
    manageableGateIds: z.array(z.string()).optional(),
  }).refine(
    (data) => {
      if (data.role === 'SECURITY_OFFICER') {
        return !!data.assignedGateId
      }
      return true
    },
    {
      message: t('users.assignedGateRequiredSecurity' as never),
      path: ['assignedGateId'],
    }
  ).refine(
    (data) => {
      if (data.role === 'SUPER_ADMIN' || data.role === 'SUPERVISOR') {
        return data.manageableGateIds && data.manageableGateIds.length > 0
      }
      return true
    },
    {
      message: t('users.manageableGatesRequired' as never),
      path: ['manageableGateIds'],
    }
  )
}

function buildEditSchema(t: (key: TranslationKey, params?: Record<string, string | number>) => string) {
  return z.object({
    username: z
      .string()
      .min(3, t('users.usernameMin' as never))
      .max(50),
    fullName: z
      .string()
      .min(1, t('users.fullNameRequired' as never))
      .max(100),
    email: z
      .string()
      .optional()
      .or(z.literal('')),
    isActive: z.boolean().optional(),
    role: z.string().min(1, t('users.roleRequired' as never)),
    assignedGateId: z.string().optional(),
    manageableGateIds: z.array(z.string()).optional(),
  }).refine(
    (data) => {
      if (data.role === 'SECURITY_OFFICER') {
        return !!data.assignedGateId
      }
      return true
    },
    {
      message: t('users.assignedGateRequiredSecurity' as never),
      path: ['assignedGateId'],
    }
  ).refine(
    (data) => {
      if (data.role === 'SUPER_ADMIN' || data.role === 'SUPERVISOR') {
        return data.manageableGateIds && data.manageableGateIds.length > 0
      }
      return true
    },
    {
      message: t('users.manageableGatesRequired' as never),
      path: ['manageableGateIds'],
    }
  )
}

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
}: UserFormDialogProps) {
  const { t } = useTranslation()
  const isEditing = !!user
  const createSchema = buildCreateSchema(t)
  const editSchema = buildEditSchema(t)
  const roleOptions = getRoleOptions(t)
  const { mutate: createUser, isPending: isCreating } = useCreateUser()
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser(
    user?.id ?? '',
  )
  const isPending = isCreating || isUpdating
  const { data: gatesData } = useGates({ page: 1, perPage: 100 })
  const gates = gatesData?.data ?? []

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      username: '',
      password: '',
      fullName: '',
      email: '',
      role: '',
      assignedGateId: '',
      manageableGateIds: [],
    },
  })

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      username: user?.username ?? '',
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      isActive: user?.isActive ?? true,
      role: user?.roles?.[0]?.name ?? '',
      assignedGateId: user?.assignedGate?.id ?? '',
      manageableGateIds: user?.manageableGates?.map((g) => g.id) ?? [],
    },
  })

  useEffect(() => {
    if (!open) return

    if (isEditing && user) {
      editForm.reset({
        username: user.username,
        fullName: user.fullName,
        email: user.email ?? '',
        isActive: user.isActive,
        role: user.roles[0]?.name ?? '',
        assignedGateId: user.assignedGate?.id ?? '',
        manageableGateIds: user.manageableGates?.map((g) => g.id) ?? [],
      })
    } else if (!isEditing) {
      createForm.reset({
        username: '',
        password: '',
        fullName: '',
        email: '',
        role: '',
        assignedGateId: '',
        manageableGateIds: [],
      })
    }
  }, [open, user, isEditing, editForm, createForm])

  function onCreateSubmit(data: CreateFormValues) {
    const { role, assignedGateId, manageableGateIds, email, ...rest } = data
    const payload: CreateUserPayload = { ...rest, roles: [role] }

    // Only include email if it's not empty
    if (email && email.trim()) {
      payload.email = email
    }

    // Only include gate fields based on role
    if (role === 'SECURITY_OFFICER') {
      if (assignedGateId) payload.assignedGateId = assignedGateId
    } else if (role === 'SUPER_ADMIN' || role === 'SUPERVISOR') {
      if (manageableGateIds && manageableGateIds.length > 0) {
        payload.manageableGateIds = manageableGateIds
      }
    }

    createUser(payload, {
      onSuccess: () => {
        createForm.reset()
        onOpenChange(false)
      },
    })
  }

  function onEditSubmit(data: EditFormValues) {
    if (!user) return
    const { role, assignedGateId, manageableGateIds, email, ...rest } = data
    const payload: UpdateUserPayload = { ...rest, roles: [role] }

    // Only include email if it's not empty
    if (email && email.trim()) {
      payload.email = email
    } else {
      payload.email = undefined
    }

    // Only include gate fields based on role
    if (role === 'SECURITY_OFFICER') {
      if (assignedGateId) payload.assignedGateId = assignedGateId
      else payload.assignedGateId = null
    } else if (role === 'SUPER_ADMIN' || role === 'SUPERVISOR') {
      if (manageableGateIds) payload.manageableGateIds = manageableGateIds
      else payload.manageableGateIds = []
    }

    updateUser(payload, {
      onSuccess: () => {
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-125'>
        <DialogHeader>
          <DialogTitle>{isEditing ? t('users.editUser' as never) : t('users.createUser' as never)}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('users.editUserDesc' as never)
              : t('users.createUserDesc' as never)}
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className='space-y-4'
            >
              <FormField
                control={editForm.control}
                name='username'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('users.username' as never)}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('users.usernameExample' as never)} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name='fullName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('users.fullName' as never)}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('users.fullNameExample' as never)} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('users.email' as never)}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('users.emailExample' as never)} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name='role'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('users.role' as never)}</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        // Clear gate fields when role changes
                        editForm.setValue('assignedGateId', '')
                        editForm.setValue('manageableGateIds', [])
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('users.selectRole' as never)} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Gate Assignment - Conditional based on role */}
              {editForm.watch('role') === 'SECURITY_OFFICER' && (
                <FormField
                  control={editForm.control}
                  name='assignedGateId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('users.assignedGate' as never)}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('users.selectGate' as never)} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {gates.map((gate) => (
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
              )}
              {(editForm.watch('role') === 'SUPER_ADMIN' ||
                editForm.watch('role') === 'SUPERVISOR') && (
                  <FormField
                    control={editForm.control}
                    name='manageableGateIds'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('users.manageableGates' as never)}</FormLabel>
                        <div className='space-y-2'>
                          {gates.map((gate) => (
                            <div key={gate.id} className='flex items-center space-x-2'>
                              <Checkbox
                                id={`gate-${gate.id}`}
                                checked={field.value?.includes(gate.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...(field.value || []), gate.id])
                                  } else {
                                    field.onChange(
                                      field.value?.filter((id) => id !== gate.id) || []
                                    )
                                  }
                                }}
                              />
                              <label
                                htmlFor={`gate-${gate.id}`}
                                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                              >
                                {gate.name}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              <div className='flex justify-end gap-3 pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  {t('common.cancel' as never)}
                </Button>
                <Button type='submit' disabled={isPending}>
                  {isPending && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  {t('users.updateUser' as never)}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className='space-y-4'
            >
              <FormField
                control={createForm.control}
                name='username'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('users.username' as never)}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('users.usernameExample' as never)} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('users.password' as never)}</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder={t('users.passwordExample' as never)}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='fullName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('users.fullName' as never)}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('users.fullNameExample' as never)} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('users.email' as never)}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('users.emailExample' as never)} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name='role'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('users.role' as never)}</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        // Clear gate fields when role changes
                        createForm.setValue('assignedGateId', '')
                        createForm.setValue('manageableGateIds', [])
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('users.selectRole' as never)} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Gate Assignment - Conditional based on role */}
              {createForm.watch('role') === 'SECURITY_OFFICER' && (
                <FormField
                  control={createForm.control}
                  name='assignedGateId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('users.assignedGate' as never)}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('users.selectGate' as never)} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {gates.map((gate) => (
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
              )}
              {(createForm.watch('role') === 'SUPER_ADMIN' ||
                createForm.watch('role') === 'SUPERVISOR') && (
                  <FormField
                    control={createForm.control}
                    name='manageableGateIds'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('users.manageableGates' as never)}</FormLabel>
                        <div className='space-y-2'>
                          {gates.map((gate) => (
                            <div key={gate.id} className='flex items-center space-x-2'>
                              <Checkbox
                                id={`create-gate-${gate.id}`}
                                checked={field.value?.includes(gate.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...(field.value || []), gate.id])
                                  } else {
                                    field.onChange(
                                      field.value?.filter((id) => id !== gate.id) || []
                                    )
                                  }
                                }}
                              />
                              <label
                                htmlFor={`create-gate-${gate.id}`}
                                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                              >
                                {gate.name}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              <div className='flex justify-end gap-3 pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  {t('common.cancel' as never)}
                </Button>
                <Button type='submit' disabled={isPending}>
                  {isPending && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  {t('users.createUser' as never)}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
