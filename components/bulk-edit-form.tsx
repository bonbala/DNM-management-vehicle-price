"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import type { Vehicle } from "@/types/vehicle"

interface BulkEditFormProps {
  vehicles: Vehicle[]
  onSubmit: (updates: Record<string, Partial<Omit<Vehicle, "id">>>) => void
  onClose: () => void
  distinctBrands: string[]
  distinctTypes: string[]
  distinctEngines: string[]
}

export default function BulkEditForm({
  vehicles,
  onSubmit,
  onClose,
  distinctBrands,
  distinctTypes,
  distinctEngines,
}: BulkEditFormProps) {
  const [editVehicles, setEditVehicles] = useState<Array<Vehicle>>(vehicles)

  const handleChange = (index: number, field: keyof Vehicle, value: any) => {
    const updated = [...editVehicles]
    updated[index] = { ...updated[index], [field]: value }
    setEditVehicles(updated)
  }

  const handleSubmit = () => {
    const updates: Record<string, Partial<Omit<Vehicle, "id">>> = {}

    editVehicles.forEach((vehicle) => {
      const original = vehicles.find((v) => v.id === vehicle.id)
      if (original) {
        const vehicleUpdate: Partial<Omit<Vehicle, "id">> = {}
        let hasChanges = false

        const fieldsToCheck: (keyof Omit<Vehicle, "id">)[] = [
          "name",
          "brand",
          "type",
          "year",
          "engineCapacity",
          "buyPrice",
          "salePrice",
        ]

        fieldsToCheck.forEach((field) => {
          if (JSON.stringify(vehicle[field]) !== JSON.stringify(original[field])) {
            ;(vehicleUpdate[field] as any) = vehicle[field]
            hasChanges = true
          }
        })

        if (hasChanges) {
          updates[vehicle.id] = vehicleUpdate
        }
      }
    })

    if (Object.keys(updates).length === 0) {
      alert("Không có thay đổi nào")
      return
    }

    onSubmit(updates)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border flex items-center justify-between bg-card sticky top-0">
          <h2 className="text-2xl font-bold text-foreground">Sửa {editVehicles.length} Xe</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-muted border-b border-border">
              <tr>
                <th className="border border-border px-4 py-3 text-left text-sm font-semibold text-foreground w-10"></th>
                <th className="border border-border px-4 py-3 text-left text-sm font-semibold text-foreground min-w-40">
                  Tên Xe
                </th>
                <th className="border border-border px-4 py-3 text-left text-sm font-semibold text-foreground min-w-32">
                  Hãng
                </th>
                <th className="border border-border px-4 py-3 text-left text-sm font-semibold text-foreground min-w-40">
                  Loại
                </th>
                <th className="border border-border px-4 py-3 text-left text-sm font-semibold text-foreground min-w-24">
                  Năm
                </th>
                <th className="border border-border px-4 py-3 text-left text-sm font-semibold text-foreground min-w-32">
                  Dung Tích
                </th>
                <th className="border border-border px-4 py-3 text-left text-sm font-semibold text-foreground min-w-40">
                  Giá Thị Trường
                </th>
                <th className="border border-border px-4 py-3 text-left text-sm font-semibold text-foreground min-w-40">
                  Giá Thu
                </th>
              </tr>
            </thead>
            <tbody>
              {editVehicles.map((vehicle, index) => (
                <tr key={vehicle.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                  <td className="border border-border px-4 py-3 text-center text-sm text-muted-foreground">
                    {index + 1}
                  </td>
                  <td className="border border-border px-4 py-3">
                    <Input
                      placeholder="Tên xe"
                      value={vehicle.name}
                      onChange={(e) => handleChange(index, "name", e.target.value)}
                      className="border-0 p-0 bg-transparent"
                    />
                  </td>
                  <td className="border border-border px-4 py-3">
                    <select
                      value={vehicle.brand}
                      onChange={(e) => handleChange(index, "brand", e.target.value)}
                      className="w-full border-0 p-0 bg-transparent text-foreground max-h-48 overflow-y-auto"
                    >
                      <option value="">Chọn hãng</option>
                      {distinctBrands.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-border px-4 py-3">
                    <select
                      value={vehicle.type}
                      onChange={(e) => handleChange(index, "type", e.target.value)}
                      className="w-full border-0 p-0 bg-transparent text-foreground max-h-48 overflow-y-auto"
                    >
                      <option value="">Chọn loại</option>
                      {distinctTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-border px-4 py-3">
                    <Input
                      type="number"
                      placeholder="Năm"
                      value={vehicle.year}
                      onChange={(e) => handleChange(index, "year", Number.parseInt(e.target.value) || vehicle.year)}
                      className="border-0 p-0 bg-transparent"
                    />
                  </td>
                  <td className="border border-border px-4 py-3">
                    <select
                      value={vehicle.engineCapacity}
                      onChange={(e) => handleChange(index, "engineCapacity", e.target.value)}
                      className="w-full border-0 p-0 bg-transparent text-foreground max-h-48 overflow-y-auto"
                    >
                      <option value="">Chọn dung tích</option>
                      {distinctEngines.map((engine) => (
                        <option key={engine} value={engine}>
                          {engine}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-border px-4 py-3">
                    <Input
                      type="number"
                      placeholder="0"
                      value={vehicle.salePrice}
                      onChange={(e) => handleChange(index, "salePrice", Number.parseInt(e.target.value) || 0)}
                      className="border-0 p-0 bg-transparent"
                    />
                  </td>
                  <td className="border border-border px-4 py-3">
                    <Input
                      type="number"
                      placeholder="0"
                      value={vehicle.buyPrice}
                      onChange={(e) => handleChange(index, "buyPrice", Number.parseInt(e.target.value) || 0)}
                      className="border-0 p-0 bg-transparent"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-border bg-card flex gap-3 justify-end sticky bottom-0">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>Cập Nhật {editVehicles.length} Xe</Button>
        </div>
      </Card>
    </div>
  )
}
