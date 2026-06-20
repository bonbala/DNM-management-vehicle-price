"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  Search,
  X,
  Loader2,
  Users,
  Package,
  User,
  Phone,
  CreditCard,
  MapPin,
  Car,
  Calendar,
  Hash,
  StickyNote,
  Clock,
  Zap,
} from "lucide-react"
import type { ViolationContract, ViolationStatus } from "@/types/violation-contract"
import type { Asset } from "@/types/asset"

const STATUS_MAP: Record<ViolationStatus, { label: string; color: string }> = {
  pending: { label: "Chờ xử lý", color: "text-yellow-600 bg-yellow-50" },
  processed: { label: "Đã xử lý", color: "text-green-600 bg-green-50" },
}

type SearchState = "idle" | "loading" | "found" | "not_found"

export default function QuickSearch({ onClose }: { onClose: () => void }) {
  const [violationQuery, setViolationQuery] = useState("")
  const [assetQuery, setAssetQuery] = useState("")

  const [violationState, setViolationState] = useState<SearchState>("idle")
  const [assetState, setAssetState] = useState<SearchState>("idle")

  const [violationResult, setViolationResult] = useState<ViolationContract | null>(null)
  const [assetResult, setAssetResult] = useState<Asset | null>(null)

  const searchViolation = async () => {
    const q = violationQuery.trim()
    if (!q) return
    setViolationState("loading")
    try {
      const res = await fetch(`/api/quick-lookup?type=violation&q=${encodeURIComponent(q)}`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error()
      const { data } = await res.json()
      if (data) {
        setViolationResult(data)
        setViolationState("found")
      } else {
        setViolationResult(null)
        setViolationState("not_found")
      }
    } catch {
      setViolationResult(null)
      setViolationState("not_found")
    }
  }

  const searchAsset = async () => {
    const q = assetQuery.trim()
    if (!q) return
    setAssetState("loading")
    try {
      const res = await fetch(`/api/quick-lookup?type=asset&q=${encodeURIComponent(q)}`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error()
      const { data } = await res.json()
      if (data) {
        setAssetResult(data)
        setAssetState("found")
      } else {
        setAssetResult(null)
        setAssetState("not_found")
      }
    } catch {
      setAssetResult(null)
      setAssetState("not_found")
    }
  }

  const formatDate = (date: string | Date) => new Date(date).toLocaleDateString("vi-VN")
  const formatDateTime = (date: string | Date) => new Date(date).toLocaleString("vi-VN")
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-4xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6">         
          <div className="mb-6">
            <div className="flex items-center justify-between ">
              <div className="flex items-center gap-2">
                <Zap size={22} className="text-primary" />
                <h2 className="text-lg font-bold text-foreground">Tra cứu nhanh</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X size={18} />
              </Button>
            </div>
            <div>
              <h2>Thời điểm tra cứu: {formatDateTime(new Date())}</h2>
            </div>
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Violation lookup */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Users size={18} className="text-orange-500" />
                <h3 className="font-semibold text-foreground">Tra cứu KH Vi Phạm</h3>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Nhập CMND / CCCD..."
                    value={violationQuery}
                    onChange={(e) => {
                      setViolationQuery(e.target.value)
                      if (violationState !== "idle") setViolationState("idle")
                    }}
                    onKeyDown={(e) => e.key === "Enter" && searchViolation()}
                    className="pl-9"
                  />
                </div>
                <Button
                  onClick={searchViolation}
                  disabled={!violationQuery.trim() || violationState === "loading"}
                  size="sm"
                  className="shrink-0"
                >
                  {violationState === "loading" ? <Loader2 size={16} className="animate-spin" /> : "Tra cứu"}
                </Button>
              </div>

              {/* Violation result */}
              <div className="min-h-[120px]">
                {violationState === "idle" && (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Users size={32} className="opacity-20 mb-2" />
                    <p className="text-sm">Nhập CMND/CCCD để tra cứu</p>
                  </div>
                )}

                {violationState === "loading" && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-primary" />
                  </div>
                )}

                {violationState === "not_found" && (
                  <div className="flex flex-col items-center justify-center py-8 rounded-lg border border-dashed border-green-300 bg-green-50/50">
                    <Users size={32} className="text-green-500 opacity-50 mb-2" />
                    <p className="text-sm font-medium text-green-700">Khách hàng không có lịch sử vi phạm</p>
                  </div>
                )}

                {violationState === "found" && violationResult && (
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{violationResult.customerName}</span>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_MAP[violationResult.status].color}`}>
                        {STATUS_MAP[violationResult.status].label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <InfoField icon={<Phone size={12} />} label="SĐT" value={violationResult.phoneNumber} />
                      <InfoField icon={<CreditCard size={12} />} label="CMND/CCCD" value={violationResult.customerId} mono />
                    </div>
                    <InfoField icon={<MapPin size={12} />} label="Địa chỉ" value={violationResult.address} />
                    <div className="grid grid-cols-2 gap-2">
                      <InfoField icon={<Car size={12} />} label="Tên xe" value={violationResult.vehicleName} />
                      <InfoField icon={<Calendar size={12} />} label="Ngày VP" value={formatDate(violationResult.violationDate)} />
                    </div>
                    {violationResult.violationMoney > 0 && (
                      <InfoField icon={<CreditCard size={12} />} label="Số tiền VP" value={formatCurrency(violationResult.violationMoney)} />
                    )}
                    {violationResult.notes?.trim() && (
                      <div className="rounded border bg-muted/30 p-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <StickyNote size={11} />
                          Ghi chú
                        </div>
                        <p className="text-xs text-foreground whitespace-pre-wrap">{violationResult.notes}</p>
                      </div>
                    )}
                    <div className="border-t pt-2 space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User size={11} />
                        Tạo bởi: <span className="font-medium text-foreground ml-0.5">{violationResult.createdBy}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={11} />
                        {formatDateTime(violationResult.createdAt)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Asset lookup */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Package size={18} className="text-blue-500" />
                <h3 className="font-semibold text-foreground">Tài sản của hệ thống</h3>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Nhập biển số xe hoặc số khung..."
                    value={assetQuery}
                    onChange={(e) => {
                      setAssetQuery(e.target.value)
                      if (assetState !== "idle") setAssetState("idle")
                    }}
                    onKeyDown={(e) => e.key === "Enter" && searchAsset()}
                    className="pl-9"
                  />
                </div>
                <Button
                  onClick={searchAsset}
                  disabled={!assetQuery.trim() || assetState === "loading"}
                  size="sm"
                  className="shrink-0"
                >
                  {assetState === "loading" ? <Loader2 size={16} className="animate-spin" /> : "Tra cứu"}
                </Button>
              </div>

              {/* Asset result */}
              <div className="min-h-[120px]">
                {assetState === "idle" && (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Package size={32} className="opacity-20 mb-2" />
                    <p className="text-sm">Nhập biển số xe hoặc số khung để tra cứu</p>
                  </div>
                )}

                {assetState === "loading" && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-primary" />
                  </div>
                )}

                {assetState === "not_found" && (
                  <div className="flex flex-col items-center justify-center py-8 rounded-lg border border-dashed border-red-300 bg-red-50/50">
                    <Package size={32} className="text-red-500 opacity-50 mb-2" />
                    <p className="text-sm font-medium text-red-700">Xe không có trong hệ thống</p>
                  </div>
                )}

                {assetState === "found" && assetResult && (
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <span className="font-semibold text-foreground">{assetResult.vehicleName}</span>
                    <div className="grid grid-cols-2 gap-2">
                      <InfoField icon={<Hash size={12} />} label="Biển số xe" value={assetResult.plateNumber} mono />
                      <InfoField icon={<Hash size={12} />} label="Số khung xe" value={assetResult.vehicleIdNumber} mono />
                    </div>
                    <InfoField icon={<User size={12} />} label="Khách hàng" value={assetResult.customerName} />
                    {assetResult.note?.trim() && (
                      <div className="rounded border bg-muted/30 p-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <StickyNote size={11} />
                          Ghi chú
                        </div>
                        <p className="text-xs text-foreground whitespace-pre-wrap">{assetResult.note}</p>
                      </div>
                    )}
                    <div className="border-t pt-2 space-y-1">
                      {assetResult.createdBy && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User size={11} />
                          Tạo bởi: <span className="font-medium text-foreground ml-0.5">{assetResult.createdBy}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={11} />
                        {formatDateTime(assetResult.createdAt)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function InfoField({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode
  label: string
  value?: string
  mono?: boolean
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className={`text-sm font-medium text-foreground ${mono ? "font-mono" : ""}`}>
        {value?.trim() ? value : <span className="text-muted-foreground font-normal italic">—</span>}
      </p>
    </div>
  )
}
