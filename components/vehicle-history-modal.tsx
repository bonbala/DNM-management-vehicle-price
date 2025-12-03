"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Loader2 } from "lucide-react"
import type { HistoryDisplay } from "@/types/history"

interface VehicleHistoryModalProps {
  vehicleId: string
  vehicleName: string
  onClose: () => void
}

export default function VehicleHistoryModal({ vehicleId, vehicleName, onClose }: VehicleHistoryModalProps) {
  const [histories, setHistories] = useState<HistoryDisplay[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadHistories = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/histories/${vehicleId}`, {
          credentials: "include",
        })
        if (!response.ok) {
          throw new Error("Lỗi khi tải lịch sử")
        }
        const data = await response.json()
        setHistories(data)
      } catch (error) {
        console.error("[v0] Failed to load histories:", error)
        alert("Lỗi khi tải lịch sử thay đổi")
      } finally {
        setIsLoading(false)
      }
    }

    loadHistories()
  }, [vehicleId])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDateTime = (date: Date) => {
    const d = new Date(date)
    return d.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const getPriceChange = (oldPrice: number, newPrice: number) => {
    const diff = newPrice - oldPrice
    const percent = ((diff / oldPrice) * 100).toFixed(2)
    const isIncrease = diff > 0
    return {
      diff,
      percent,
      isIncrease,
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-3xl p-8">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-muted-foreground">Đang tải lịch sử...</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Lịch Sử Thay Đổi Giá</h2>
            <p className="text-sm text-muted-foreground mt-1">{vehicleName}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-auto flex-1">
          {histories.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>Chưa có lịch sử thay đổi giá cho xe này</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">STT</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Giá Cũ</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Giá Mới</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Thay Đổi</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Nhân Viên</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Thời Gian</th>
                  </tr>
                </thead>
                <tbody>
                  {histories.map((history, index) => {
                    const priceChange = getPriceChange(history.oldPrice, history.newPrice)
                    return (
                      <tr key={history.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                        <td className="px-6 py-3 text-sm">{index + 1}</td>
                        <td className="px-6 py-3 text-sm text-muted-foreground">{formatPrice(history.oldPrice)}</td>
                        <td className="px-6 py-3 text-sm font-medium">{formatPrice(history.newPrice)}</td>
                        <td className="px-6 py-3 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              priceChange.isIncrease
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {priceChange.isIncrease ? "+" : "-"}
                            {formatPrice(Math.abs(priceChange.diff))} ({priceChange.percent}%)
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm">{history.staffName}</td>
                        <td className="px-6 py-3 text-sm text-muted-foreground whitespace-nowrap">
                          {formatDateTime(new Date(history.createdAt))}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="border-t border-border bg-card p-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </Card>
    </div>
  )
}
