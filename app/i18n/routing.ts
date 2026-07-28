import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const locales = ['en'] as const
export type SupportedLanguage = (typeof locales)[number]

export const routing = defineRouting({
  locales,
  defaultLocale: 'en' as SupportedLanguage,
  localePrefix: 'as-needed'
})

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
