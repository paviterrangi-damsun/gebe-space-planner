'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export interface DownloadPlanFormData {
  name: string
  email: string
  phone: string
  message: string
}

interface DownloadPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: DownloadPlanFormData) => Promise<void>
}

const EMPTY_FORM: DownloadPlanFormData = { name: '', email: '', phone: '', message: '' }

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function DownloadPlanDialog({ open, onOpenChange, onSubmit }: DownloadPlanDialogProps) {
  const t = useTranslations('BluePrint.downloadDialog')
  const [form, setForm] = useState<DownloadPlanFormData>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM)
      setSubmitting(false)
      setTouched(false)
    }
  }, [open])

  const nameValid = form.name.trim().length > 0
  const emailValid = isValidEmail(form.email.trim())
  const formValid = nameValid && emailValid

  const handleChange = (field: keyof DownloadPlanFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async () => {
    setTouched(true)
    if (!formValid || submitting) return
    setSubmitting(true)
    try {
      await onSubmit(form)
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="dp-name">{t('nameLabel')}</Label>
            <Input
              id="dp-name"
              value={form.name}
              onChange={handleChange('name')}
              placeholder={t('namePlaceholder')}
              aria-invalid={touched && !nameValid}
              autoFocus
            />
            {touched && !nameValid && (
              <p className="text-xs text-destructive">{t('nameRequired')}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dp-email">{t('emailLabel')}</Label>
            <Input
              id="dp-email"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder={t('emailPlaceholder')}
              aria-invalid={touched && !emailValid}
            />
            {touched && !emailValid && (
              <p className="text-xs text-destructive">{t('emailInvalid')}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dp-phone">{t('phoneLabel')}</Label>
            <Input
              id="dp-phone"
              type="tel"
              value={form.phone}
              onChange={handleChange('phone')}
              placeholder={t('phonePlaceholder')}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dp-message">{t('messageLabel')}</Label>
            <Textarea
              id="dp-message"
              value={form.message}
              onChange={handleChange('message')}
              placeholder={t('messagePlaceholder')}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={submitting}>
            {t('cancel')}
          </Button>
          <Button variant="default" onClick={handleSubmit} disabled={submitting}>
            {submitting ? t('submitting') : t('submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
