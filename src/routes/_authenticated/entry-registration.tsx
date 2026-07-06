import { createFileRoute } from '@tanstack/react-router'
import { EntryRegistration } from '../../features/entry'

export const Route = createFileRoute('/_authenticated/entry-registration')({
  component: EntryRegistration,
})
