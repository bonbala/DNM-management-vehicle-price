"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

interface FilterBarProps {
  filters: {
    brand: string
    type: string
    year: number | ""
    engineCapacity: string
  }
  onFiltersChange: (filters: any) => void
  distinctBrands: string[]
  distinctTypes: string[]
  distinctYears: number[]
  distinctEngines: string[]
}

export default function FilterBar({
  filters,
  onFiltersChange,
  distinctBrands,
  distinctTypes,
  distinctYears,
  distinctEngines,
}: FilterBarProps) {
  const handleReset = () => {
    onFiltersChange({
      brand: "",
      type: "",
      year: "",
      engineCapacity: "",
    })
  }

  return (
    <div className="w-64">
      <Card className="p-4 sticky top-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Bộ Lọc</h3>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2 h-8">
            <RotateCcw size={14} />
            <span className="text-xs">Đặt Lại</span>
          </Button>
        </div>

        {/* Brand Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Hãng</label>
          <select
            value={filters.brand}
            onChange={(e) => onFiltersChange({ ...filters, brand: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm max-h-48 overflow-y-auto"
          >
            <option value="">Tất cả</option>
            {distinctBrands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Loại</label>
          <select
            value={filters.type}
            onChange={(e) => onFiltersChange({ ...filters, type: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm max-h-48 overflow-y-auto"
          >
            <option value="">Tất cả</option>
            {distinctTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Năm</label>
          <select
            value={filters.year}
            onChange={(e) => onFiltersChange({ ...filters, year: e.target.value ? Number(e.target.value) : "" })}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm max-h-48 overflow-y-auto"
          >
            <option value="">Tất cả</option>
            {distinctYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Engine Capacity Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Dung Tích</label>
          <select
            value={filters.engineCapacity}
            onChange={(e) => onFiltersChange({ ...filters, engineCapacity: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm max-h-48 overflow-y-auto"
          >
            <option value="">Tất cả</option>
            {distinctEngines.map((engine) => (
              <option key={engine} value={engine}>
                {engine}
              </option>
            ))}
          </select>
        </div>
      </Card>
    </div>
  )
}
