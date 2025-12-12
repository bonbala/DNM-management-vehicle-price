"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import type { Vehicle } from "@/types/vehicle"

interface VehicleFormProps {
  vehicle?: Vehicle | null
  onSubmit: (data: Omit<Vehicle, "id">) => void
  onClose: () => void
  distinctBrands: string[]
  distinctTypes: string[]
  distinctEngines: string[]
}

export default function VehicleForm({
  vehicle,
  onSubmit,
  onClose,
  distinctBrands,
  distinctTypes,
  distinctEngines,
}: VehicleFormProps) {
  const [formData, setFormData] = useState({
    name: vehicle?.name || "",
    brand: vehicle?.brand || "",
    type: vehicle?.type || "",
    year: vehicle?.year || new Date().getFullYear(),
    engineCapacity: vehicle?.engineCapacity || "",
    salePrice: vehicle?.salePrice || 0,
    buyPrice: vehicle?.buyPrice || 0,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("Price") || name === "year" ? Number(value) : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">{vehicle ? "Chỉnh Sửa Xe" : "Thêm Xe Mới"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tên Xe *</label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="VD: Winner 150cc"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Hãng *</label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground max-h-48 overflow-y-auto"
                required
              >
                <option value="">Chọn hãng</option>
                {distinctBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Type and Year Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Loại Xe *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground max-h-48 overflow-y-auto"
                required
              >
                <option value="">Chọn loại</option>
                {distinctTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Năm Sản Xuất *</label>
              <Input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min={2000}
                max={new Date().getFullYear() + 1}
                required
              />
            </div>
          </div>

          {/* Engine Capacity Row */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Dung Tích Động Cơ *</label>
              <select
                name="engineCapacity"
                value={formData.engineCapacity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground max-h-48 overflow-y-auto"
                required
              >
                <option value="">Chọn dung tích</option>
                {distinctEngines.map((engine) => (
                  <option key={engine} value={engine}>
                    {engine}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prices Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Giá Thị Trường (VNĐ) *</label>
              <Input
                type="number"
                name="salePrice"
                value={formData.salePrice}
                onChange={handleChange}
                placeholder="0"
                min={0}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Giá Thu (VNĐ) *</label>
              <Input
                type="number"
                name="buyPrice"
                value={formData.buyPrice}
                onChange={handleChange}
                placeholder="0"
                min={0}
                required
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground">
              {vehicle ? "Cập Nhật" : "Thêm Mới"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
