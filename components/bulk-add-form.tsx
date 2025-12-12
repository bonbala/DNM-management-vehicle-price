"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Plus } from "lucide-react"
import type { Vehicle } from "@/types/vehicle"

interface BulkAddFormProps {
  onSubmit: (vehicles: Omit<Vehicle, "id">[]) => void
  onClose: () => void
  distinctBrands: string[]
  distinctTypes: string[]
  distinctEngines: string[]
}

export default function BulkAddForm({
  onSubmit,
  onClose,
  distinctBrands,
  distinctTypes,
  distinctEngines,
}: BulkAddFormProps) {
  const [vehicles, setVehicles] = useState<Omit<Vehicle, "id">[]>([
    {
      name: "",
      brand: "",
      type: "",
      year: new Date().getFullYear(),
      engineCapacity: "",
      salePrice: 0,
      buyPrice: 0,
    },
  ])

  const handleAddRow = () => {
    setVehicles([
      ...vehicles,
      {
        name: "",
        brand: "",
        type: "",
        year: new Date().getFullYear(),
        engineCapacity: "",
        salePrice: 0,
        buyPrice: 0,
      },
    ])
  }

  const handleRemoveRow = (index: number) => {
    setVehicles(vehicles.filter((_, i) => i !== index))
  }

  const handleChange = (index: number, field: keyof Omit<Vehicle, "id">, value: any) => {
    const updated = [...vehicles]
    updated[index] = { ...updated[index], [field]: value }
    setVehicles(updated)
  }

  const handleSubmit = () => {
    const validVehicles = vehicles.filter((v) => v.name && v.brand && v.type)
    if (validVehicles.length === 0) {
      alert("Vui lòng nhập ít nhất một xe hoàn chỉnh")
      return
    }
    onSubmit(validVehicles)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border flex items-center justify-between bg-card sticky top-0">
          <h2 className="text-2xl font-bold text-foreground">Thêm Nhiều Xe</h2>
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
                <th className="border border-border px-4 py-3 text-center text-sm font-semibold text-foreground w-12">
                  Xóa
                </th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
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
                  <td className="border border-border px-4 py-3 text-center">
                    {vehicles.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRow(index)}
                        className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-border bg-card flex gap-3 justify-between sticky bottom-0">
          <Button variant="outline" onClick={handleAddRow} className="gap-2 bg-transparent">
            <Plus size={18} />
            Thêm Dòng
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={handleSubmit}>Thêm {vehicles.length} Xe</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
