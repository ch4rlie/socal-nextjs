'use client'

import { useState, useEffect } from 'react'
import { useShipping } from '@/hooks/useShipping'
import { ShippingRegion } from '@/types/shipping'
import { detectUserRegion } from '@/utils/region-detection'
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button
} from '@nextui-org/react'

const REGION_LABELS: Record<ShippingRegion, string> = {
  'USA': 'United States',
  'Europe': 'Europe',
  'United Kingdom': 'United Kingdom',
  'EFTA States': 'EFTA States',
  'Canada': 'Canada',
  'Australia/New Zealand': 'Australia & New Zealand',
  'Japan': 'Japan',
  'Brazil': 'Brazil',
  'Worldwide': 'Rest of World'
}

const REGION_FLAGS: Record<ShippingRegion, string> = {
  'USA': '🇺🇸',
  'Europe': '🇪🇺',
  'United Kingdom': '🇬🇧',
  'EFTA States': '🇨🇭',
  'Canada': '🇨🇦',
  'Australia/New Zealand': '🇦🇺',
  'Japan': '🇯🇵',
  'Brazil': '🇧🇷',
  'Worldwide': '🌍'
}

export function RegionSelector() {
  const { region, setRegion } = useShipping()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    async function autoDetectRegion() {
      try {
        const detectedRegion = await detectUserRegion()
        setRegion(detectedRegion)
      } catch (error) {
        console.warn('Failed to auto-detect region:', error)
      }
    }

    if (region === 'USA') {
      autoDetectRegion()
    }
  }, [setRegion, region])

  return (
    <Dropdown 
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <DropdownTrigger>
        <Button 
          variant="bordered" 
          size="sm"
          className="text-sm bg-white dark:bg-black"
        >
          <span>{REGION_FLAGS[region]}</span>
          <span> {REGION_LABELS[region]}</span>
          <i className="fa-solid fa-chevron-down text-xs ml-2" />
        </Button>
      </DropdownTrigger>

      <DropdownMenu 
        aria-label="Select shipping region"
        selectionMode="single" 
        selectedKeys={new Set([region])}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as ShippingRegion
          if (selected) {
            setRegion(selected)
          }
        }}
      >
        {Object.entries(REGION_LABELS).map(([value, label]) => (
          <DropdownItem key={value} className="text-sm">
            <div className="flex items-center gap-2">
              {region === value && (
                <i className="fa-solid fa-check text-xs" />
              )}
              <span className="inline-flex items-center gap-x-2">
                <span>{REGION_FLAGS[value as ShippingRegion]}</span>
                <span>{label}</span>
              </span>
            </div>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  )
}
