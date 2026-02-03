"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, Lock, History } from "lucide-react"
import type { Vehicle } from "@/types/vehicle"

interface VehicleCardProps {
  vehicle: Vehicle
  isSelected?: boolean
  onSelect?: (checked: boolean) => void
  onEdit: (vehicle: Vehicle) => void
  onDelete: (id: string) => void
  onViewHistory?: (vehicleId: string) => void
  isAuthenticated: boolean
  canEdit?: boolean
  userRole?: string
}

export default function VehicleCard({
  vehicle,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onViewHistory,
  isAuthenticated,
  canEdit = false,
  userRole,
}: VehicleCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const canPerformActions = isAuthenticated && (userRole === "admin" || userRole === "super_admin")

  return (
    <Card className={`overflow-hidden transition-all ${isSelected ? "ring-2 ring-primary bg-primary/5" : ""}`}>
      {/* Header với tên xe và actions */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{vehicle.name}</h3>
          </div>
          {canPerformActions && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(vehicle)}
                className="text-primary hover:bg-primary/10 h-8 w-8 p-0"
                title="Chỉnh sửa"
              >
                <Edit2 size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewHistory?.(vehicle.id)}
                className="text-blue-600 hover:bg-blue-100 h-8 w-8 p-0"
                title="Xem lịch sử"
              >
                <History size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm("Bạn có chắc chắn muốn xóa xe này?")) {
                    onDelete(vehicle.id)
                  }
                }}
                className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                title="Xóa"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Body với thông tin chi tiết */}
      <div className="p-4 space-y-3">
        {/* Row 1: Năm & Hãng */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-xs text-muted-foreground font-medium">Năm xe:</span>
            <p className="text-sm font-semibold text-foreground">{vehicle.year}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">Hãng xe:</span>
            <p className="text-sm font-semibold text-foreground">{vehicle.brand}</p>
          </div>
        </div>

        {/* Row 2: Dung tích & Loại xe */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-xs text-muted-foreground font-medium">Dung tích:</span>
            <p className="text-sm font-semibold text-foreground">{vehicle.engineCapacity}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium">Loại xe:</span>
            <p className="text-sm font-semibold text-foreground">{vehicle.type}</p>
          </div>
        </div>

        {/* Row 3: Giá thị trường */}
        <div>
          <span className="text-xs text-muted-foreground font-medium">Giá thị trường:</span>
          {isAuthenticated ? (
            <p className="text-sm font-semibold text-foreground">{formatPrice(vehicle.salePrice)}</p>
          ) : (
            <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
              <Lock size={12} />
              <span>Không có quyền</span>
            </div>
          )}
        </div>

        {/* Row 4: Giá thu mua */}
        <div>
          <span className="text-xs text-muted-foreground font-medium">Giá thu mua:</span>
          {isAuthenticated ? (
            <p className="text-sm font-semibold text-foreground">{formatPrice(vehicle.buyPrice)}</p>
          ) : (
            <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
              <Lock size={12} />
              <span>Không có quyền</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
