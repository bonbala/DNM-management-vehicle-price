"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit2, Trash2, Lock, History } from "lucide-react"
import type { Vehicle } from "@/types/vehicle"

interface VehicleTableProps {
  vehicles: Vehicle[]
  selectedIds: Set<string>
  onSelectAll: (checked: boolean) => void
  onSelectVehicle: (id: string, checked: boolean) => void
  onEdit: (vehicle: Vehicle) => void
  onDelete: (id: string) => void
  onViewHistory?: (vehicleId: string) => void
  isAuthenticated: boolean
  canEdit?: boolean
  userRole?: string
}

export default function VehicleTable({
  vehicles,
  selectedIds,
  onSelectAll,
  onSelectVehicle,
  onEdit,
  onDelete,
  onViewHistory,
  isAuthenticated,
  canEdit = false,
  userRole,
}: VehicleTableProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (vehicles.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Không tìm thấy xe phù hợp</p>
        </div>
      </Card>
    )
  }

  const allSelected = vehicles.length > 0 && vehicles.every((v) => selectedIds.has(v.id))

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => onSelectAll(checked as boolean)}
                  disabled={!isAuthenticated}
                />
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Tên Xe</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Năm</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Hãng</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Loại</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Dung Tích</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Giá Bán</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle, index) => (
              <tr
                key={vehicle.id}
                className={`${index % 2 === 0 ? "bg-background" : "bg-muted/30"} ${
                  selectedIds.has(vehicle.id) && isAuthenticated ? "bg-primary/10" : ""
                }`}
              >
                <td className="px-6 py-4">
                  <Checkbox
                    checked={selectedIds.has(vehicle.id)}
                    onCheckedChange={(checked) => onSelectVehicle(vehicle.id, checked as boolean)}
                    disabled={!isAuthenticated}
                  />
                </td>
                <td className="px-6 py-4 text-sm font-medium text-foreground">{vehicle.name}</td>
                <td className="px-6 py-4 text-sm text-foreground">{vehicle.year}</td>
                <td className="px-6 py-4 text-sm text-foreground">{vehicle.brand}</td>
                <td className="px-6 py-4 text-sm text-foreground">{vehicle.type}</td>
                <td className="px-6 py-4 text-sm text-foreground">{vehicle.engineCapacity}</td>
                <td className={isAuthenticated ? "px-6 py-4 text-sm font-semibold text-foreground" : "px-6 py-4"}>
                  {isAuthenticated ? formatPrice(vehicle.salePrice) : (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Lock size={14} />
                      <span>Không có quyền</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {isAuthenticated && (userRole === "admin" || userRole === "super_admin") ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(vehicle)}
                          className="text-primary hover:bg-primary/10"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewHistory?.(vehicle.id)}
                          className="text-blue-600 hover:bg-blue-100"
                          title="Xem lịch sử thay đổi"
                        >
                          <History size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Bạn có chắc chắn muốn xóa xe này?")) {
                              onDelete(vehicle.id)
                            }
                          }}
                          className="text-destructive hover:bg-destructive/10"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Lock size={14} />
                        <span>Không có quyền</span>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
