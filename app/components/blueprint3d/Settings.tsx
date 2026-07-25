'use client'

import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface SettingsProps {
  onUnitChange?: (unit: string) => void
}

export function Settings({ onUnitChange }: SettingsProps) {
  const t = useTranslations('BluePrint.settings')

  const [selectedUnit, setSelectedUnit] = useState('inch')

  // Load saved unit from localStorage on mount
  useEffect(() => {
    const savedUnit = localStorage.getItem('dimensionUnit')
    if (savedUnit) {
      setSelectedUnit(savedUnit)
    }
  }, [])

  const handleUnitChange = (unit: string) => {
    setSelectedUnit(unit)
    // Save to localStorage
    localStorage.setItem('dimensionUnit', unit)
    // Notify parent component
    onUnitChange?.(unit)
    // Dispatch custom event for same-window listeners (like BedSizeInput)
    window.dispatchEvent(new CustomEvent('dimensionUnitChanged', { detail: { unit } }))
  }

  const units = [
    { value: 'inch', label: t('units.inch.label'), description: t('units.inch.description') },
    { value: 'm', label: t('units.m.label'), description: t('units.m.description') },
    { value: 'cm', label: t('units.cm.label'), description: t('units.cm.description') },
    { value: 'mm', label: t('units.mm.label'), description: t('units.mm.description') }
  ]

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-8">
      <div className="flex items-center gap-3 text-foreground mb-6">
        <SettingsIcon className="h-7 w-7" />
        <h1 className="text-2xl font-bold">{t('title')}</h1>
      </div>

      <div className="space-y-8">
        {/* Dimension Unit Settings */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">{t('dimensionUnit')}</h2>
          <p className="text-sm text-muted-foreground mb-4">{t('dimensionUnitDescription')}</p>
        </div>

        <RadioGroup value={selectedUnit} onValueChange={handleUnitChange}>
          <div className="space-y-3">
            {units.map((unit) => (
              <Label
                key={unit.value}
                htmlFor={`unit-${unit.value}`}
                className={cn(
                  'flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer hover:bg-accent transition-all',
                  selectedUnit === unit.value
                    ? 'border-primary bg-primary-50'
                    : 'border-border bg-card'
                )}
              >
                <RadioGroupItem value={unit.value} id={`unit-${unit.value}`} className="mt-1.5" />
                <div className="flex-1">
                  <div className="font-semibold text-base text-foreground">{unit.label}</div>
                  <div className="text-sm text-muted-foreground mt-1">{unit.description}</div>
                </div>
                {selectedUnit === unit.value && (
                  <div className="text-primary font-medium text-sm mt-1.5 flex items-center gap-1">
                    <Check className="h-4 w-4" /> {t('active')}
                  </div>
                )}
              </Label>
            ))}
          </div>
        </RadioGroup>

        <div className="mt-6 p-4 bg-primary-50 border-l-4 border-primary rounded">
          <p className="text-sm text-foreground">
            <strong>{t('currentSelection')}:</strong>{' '}
            {units.find((u) => u.value === selectedUnit)?.label}
          </p>
          <p className="text-sm text-muted-foreground mt-2">{t('appliesTo')}</p>
          <ul className="text-sm text-muted-foreground mt-1 ml-4 list-disc">
            <li>{t('applies2dFloorplan')}</li>
            <li>{t('applies3dDimensions')}</li>
            <li>{t('appliesAllDimensions')}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
