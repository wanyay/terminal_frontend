import { Languages, Check } from 'lucide-react'
import { languages } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useLanguage, useTranslation } from '@/context/language-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage()
  const { t } = useTranslation()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='scale-95 rounded-full'
          title={t('common.select') + ' ' + t('app.name')}
        >
          <Languages className='size-[1.2rem]' />
          <span className='sr-only'>{t('common.select')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
          >
            {lang.label}
            <Check
              size={14}
              className={cn('ms-auto', language !== lang.code && 'hidden')}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
