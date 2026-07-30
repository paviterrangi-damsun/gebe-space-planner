'use client'

import { Settings, FilePlus, Download } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useTranslations } from 'next-intl'
import { useIsMobile } from "@/hooks/use-media-query"

interface TopNavBarProps {
  activeTab: 'projects' | 'edit' | 'items'
  onTabChange: (tab: 'projects' | 'edit' | 'items') => void
  viewMode: '2d' | '3d'
  onViewModeChange: (mode: '2d' | '3d') => void
  onSettingsClick: () => void
  onSave: () => void
  onDownload: () => void
  onNew: () => void
  currentBlueprintName?: string | null
}

export function TopNavBar({
  activeTab,
  onTabChange,
  viewMode,
  onViewModeChange,
  onSettingsClick,
  onSave,
  onDownload,
  onNew,
  currentBlueprintName
}: TopNavBarProps) {
  const t = useTranslations('BluePrint.sidebar')
  const tMain = useTranslations('BluePrint.mainControls')
  const isMobile = useIsMobile()

  const tabs = [
    { id: 'projects' as const, label: t('projects') },
    { id: 'edit' as const, label: t('edit') },
    { id: 'items' as const, label: t('addItems') }
  ]

  // Tabs and tools share this visibility rule: hidden while drawing the 2D floorplan.
  const showSideSections = !(activeTab === 'edit' && viewMode === '2d')

  return (
    <div className={cn('bg-transparent flex items-center', isMobile ? 'h-12' : 'h-14')}>
      {/* Left: Tabs - Hidden in 2D mode. Kept as an equal-width flex column
          (matched by the right column) so the center switch stays centered
          regardless of which side sections are shown. */}
      <div className={cn('flex-1 flex items-center', isMobile ? 'pl-2 gap-0.5' : 'pl-4 gap-1')}>
        {showSideSections &&
          tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'rounded-md font-medium transition-colors',
                isMobile ? 'px-2 py-1.5 text-xs' : 'px-4 py-2 text-sm',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
      </div>

      {/* Center: 2D/3D Switch */}
      <div className="flex-shrink-0 flex items-center justify-center">
        {activeTab === 'edit' && (
          <div className={cn(
            'flex items-center bg-background/50 backdrop-blur-sm rounded-full border border-border/50',
            isMobile ? 'gap-2 px-3 py-1.5' : 'gap-3 px-4 py-2'
          )}>
            <span className={cn(
              'font-medium transition-colors',
              isMobile ? 'text-xs' : 'text-sm',
              viewMode === '2d' ? 'text-foreground' : 'text-muted-foreground'
            )}>
              2D
            </span>
            <Switch
              checked={viewMode === '3d'}
              onCheckedChange={(checked) => onViewModeChange(checked ? '3d' : '2d')}
              className={cn(isMobile && 'h-4 w-7')}
            />
            <span className={cn(
              'font-medium transition-colors',
              isMobile ? 'text-xs' : 'text-sm',
              viewMode === '3d' ? 'text-foreground' : 'text-muted-foreground'
            )}>
              3D
            </span>
          </div>
        )}
      </div>

      {/* Right: Tools - Hidden in 2D mode */}
      <div className={cn('flex-1 flex items-center justify-end', isMobile ? 'pr-2 gap-1' : 'pr-4 gap-2')}>
        {showSideSections && (
          <>
            {/* New Button */}
            <Button
              onClick={onNew}
              variant="outline"
              size={isMobile ? 'sm' : 'sm'}
              className={cn(isMobile && 'h-8 px-3 text-xs')}
            >
              <FilePlus className={cn('h-4 w-4', !isMobile && 'mr-1.5')} />
              {!isMobile && tMain('newPlan')}
            </Button>

            {/* Save Button */}
            <Button
              onClick={onSave}
              variant="default"
              size={isMobile ? 'sm' : 'sm'}
              className={cn(isMobile && 'h-8 px-3 text-xs')}
            >
              {tMain('savePlan')}
            </Button>

            {/* Download Plan (PDF) Button */}
            <Button
              onClick={onDownload}
              variant="outline"
              size={isMobile ? 'sm' : 'sm'}
              className={cn(isMobile && 'h-8 px-3 text-xs')}
            >
              <Download className={cn('h-4 w-4', !isMobile && 'mr-1.5')} />
              {!isMobile && tMain('downloadPlan')}
            </Button>

            {/* Settings Button */}
            <Button
              onClick={onSettingsClick}
              variant="outline"
              size="icon"
              className={cn(isMobile ? 'h-8 w-8' : 'h-9 w-9')}
              aria-label="Settings"
            >
              <Settings className={cn(isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
