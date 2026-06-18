"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  LogOut,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit3,
  X,
  Search,
  Package,
  Car,
  Hash,
  User,
  StickyNote,
  Clock,
} from "lucide-react"
import type { Asset, CreateAssetDto } from "@/types/asset"

const EMPTY_FORM: CreateAssetDto = {
  vehicleName: "",
  plateNumber: "",
  vehicleIdNumber: "",
  customerName: "",
  note: "",
}

export default function QltsPage() {
  const router = useRouter()
  const { user, logout, isAuthenticated, canAccess } = useAuth()

  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTableLoading, setIsTableLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [form, setForm] = useState<CreateAssetDto>(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null)

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1)
    }, 600)
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current) }
  }, [searchTerm])

  const fetchAssets = async (showFullLoading = false) => {
    if (showFullLoading) setIsLoading(true)
    else setIsTableLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(limit),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      })
      const res = await fetch(`/api/qlts?${params}`, { credentials: "include" })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setAssets(data.data)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch {
      alert("Lỗi khi tải danh sách tài sản")
    } finally {
      setIsLoading(false)
      setIsTableLoading(false)
    }
  }

  useEffect(() => { fetchAssets(true) }, [])
  useEffect(() => { fetchAssets() }, [currentPage, debouncedSearch])

  const openAdd = () => {
    setEditingAsset(null)
    setForm({ ...EMPTY_FORM })
    setFormError(null)
    setShowForm(true)
  }

  const openEdit = (a: Asset, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setEditingAsset(a)
    setForm({
      vehicleName: a.vehicleName,
      plateNumber: a.plateNumber,
      vehicleIdNumber: a.vehicleIdNumber,
      customerName: a.customerName,
      note: a.note || "",
    })
    setFormError(null)
    setViewingAsset(null)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.vehicleName || !form.plateNumber || !form.vehicleIdNumber || !form.customerName) {
      setFormError("Vui lòng điền đầy đủ: Tên xe, Biển số xe, Số khung xe và Tên khách hàng")
      return
    }
    setIsSubmitting(true)
    setFormError(null)
    try {
      const url = editingAsset ? `/api/qlts/${editingAsset.id}` : "/api/qlts"
      const method = editingAsset ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        setFormError(err.error || "Lỗi khi lưu dữ liệu")
        return
      }
      setShowForm(false)
      fetchAssets()
    } catch {
      setFormError("Lỗi kết nối. Vui lòng thử lại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!confirm("Bạn có chắc muốn xóa tài sản này?")) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/qlts/${id}`, { method: "DELETE", credentials: "include" })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Lỗi ${res.status}`)
      }
      if (viewingAsset?.id === id) setViewingAsset(null)
      fetchAssets()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Lỗi khi xóa tài sản")
    } finally {
      setDeletingId(null)
    }
  }

  const formatDateTime = (date: string | Date) =>
    new Date(date).toLocaleString("vi-VN")

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-2">
              <Package size={22} className="text-primary" />
              <div>
                <h1 className="text-lg font-bold text-foreground leading-tight">Quản Lý Tài Sản</h1>
                <p className="text-xs text-muted-foreground">Quản lý danh sách tài sản xe</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <div className="text-sm text-right hidden sm:block">
                <p className="text-muted-foreground text-xs">Đăng nhập với</p>
                <p className="font-medium text-foreground">
                  {user?.username}
                  {user?.role === "super_admin" && <span className="text-xs text-primary ml-1">(👑)</span>}
                  {user?.role === "admin" && <span className="text-xs text-blue-600 ml-1">(👨‍💼)</span>}
                </p>
              </div>
            )}
            <Button variant="outline" onClick={logout} className="gap-2 hover:bg-red-500 hover:text-white">
              <LogOut size={16} />
              <span className="hidden sm:inline">Đăng xuất</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên xe, biển số, số khung, KH..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Tổng: <strong>{total}</strong> tài sản
            </span>
            {canAccess(["admin", "super_admin"]) && (
              <Button onClick={openAdd} className="gap-2 whitespace-nowrap">
                <Plus size={16} />
                Thêm mới
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">STT</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Tên xe</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Biển số xe</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Số khung xe</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Tên khách hàng</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Ghi chú</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Ngày tạo</th>
                  {canAccess(["admin", "super_admin"]) && (
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground whitespace-nowrap">Thao tác</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {isTableLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <Loader2 size={24} className="animate-spin text-primary mx-auto" />
                    </td>
                  </tr>
                ) : assets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted-foreground">
                      <Package size={40} className="mx-auto mb-2 opacity-30" />
                      <p>Chưa có tài sản nào</p>
                    </td>
                  </tr>
                ) : (
                  assets.map((a, idx) => {
                    const isSelected = viewingAsset?.id === a.id
                    return (
                    <tr
                      key={a.id}
                      className={`border-b last:border-0 transition-colors cursor-pointer select-none ${
                        isSelected
                          ? "bg-primary/5 border-l-2 border-l-primary"
                          : "hover:bg-muted/30"
                      }`}
                      onClick={() => setViewingAsset(isSelected ? null : a)}
                    >
                      <td className="px-4 py-3 text-muted-foreground">
                        {(currentPage - 1) * limit + idx + 1}
                      </td>
                      <td className="px-4 py-3 font-medium">{a.vehicleName}</td>
                      <td className="px-4 py-3 font-mono">{a.plateNumber}</td>
                      <td className="px-4 py-3 font-mono text-xs">{a.vehicleIdNumber}</td>
                      <td className="px-4 py-3">{a.customerName}</td>
                      <td className="px-4 py-3 max-w-[200px]">
                        {a.note ? (
                          <span className="text-muted-foreground text-xs line-clamp-2" title={a.note}>
                            {a.note}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40 text-xs italic">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                        {formatDateTime(a.createdAt)}
                      </td>
                      {canAccess(["admin", "super_admin"]) && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                              onClick={(e) => openEdit(a, e)}
                            >
                              <Edit3 size={15} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                              onClick={(e) => handleDelete(a.id, e)}
                              disabled={deletingId === a.id}
                            >
                              {deletingId === a.id ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <Trash2 size={15} />
                              )}
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Trang {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewingAsset && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setViewingAsset(null)}
        >
          <Card
            className="w-full max-w-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Package size={20} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{viewingAsset.vehicleName}</h2>
                    <p className="text-sm text-muted-foreground">{viewingAsset.customerName}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setViewingAsset(null)}>
                  <X size={18} />
                </Button>
              </div>

              {/* Info grid */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <ViewField icon={<Car size={14} />} label="Tên xe" value={viewingAsset.vehicleName} />
                  <ViewField icon={<User size={14} />} label="Tên khách hàng" value={viewingAsset.customerName} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <ViewField icon={<Hash size={14} />} label="Biển số xe" value={viewingAsset.plateNumber} mono />
                  <ViewField icon={<Hash size={14} />} label="Số khung xe" value={viewingAsset.vehicleIdNumber} mono />
                </div>

                {/* Ghi chú */}
                <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <StickyNote size={13} />
                    Ghi chú
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed min-h-8">
                    {viewingAsset.note?.trim()
                      ? viewingAsset.note
                      : <span className="text-muted-foreground italic text-xs">Không có ghi chú</span>
                    }
                  </p>
                </div>

                {/* Meta */}
                <div className="border-t pt-3 space-y-1.5">
                  {viewingAsset.createdBy && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User size={12} />
                      Tạo bởi: <span className="font-medium text-foreground ml-1">{viewingAsset.createdBy}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock size={12} />
                    Tạo lúc: {formatDateTime(viewingAsset.createdAt)}
                  </div>
                  {viewingAsset.updatedAt && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock size={12} />
                      Cập nhật: {formatDateTime(viewingAsset.updatedAt)}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {canAccess(["admin", "super_admin"]) && (
                <div className="flex gap-2 mt-5 pt-4 border-t justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    onClick={(e) => handleDelete(viewingAsset.id, e)}
                    disabled={deletingId === viewingAsset.id}
                  >
                    {deletingId === viewingAsset.id
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Trash2 size={14} />
                    }
                    Xóa
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={(e) => openEdit(viewingAsset, e)}
                  >
                    <Edit3 size={14} />
                    Chỉnh sửa
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">
                  {editingAsset ? "Chỉnh sửa tài sản" : "Thêm tài sản mới"}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                  <X size={18} />
                </Button>
              </div>

              {formError && (
                <div className="mb-4 px-4 py-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Tên xe <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={form.vehicleName}
                    onChange={(e) => { setForm({ ...form, vehicleName: e.target.value }); setFormError(null) }}
                    placeholder="Honda Wave Alpha 2022"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">
                      Biển số xe <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={form.plateNumber}
                      onChange={(e) => { setForm({ ...form, plateNumber: e.target.value }); setFormError(null) }}
                      placeholder="59F1-12345"
                      required
                      className={formError?.includes("Biển số xe") ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {formError?.includes("Biển số xe") && (
                      <p className="text-xs text-red-600">{formError}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">
                      Số khung xe <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={form.vehicleIdNumber}
                      onChange={(e) => { setForm({ ...form, vehicleIdNumber: e.target.value }); setFormError(null) }}
                      placeholder="RLHJC5110MY..."
                      required
                      className={formError?.includes("Số khung xe") ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {formError?.includes("Số khung xe") && (
                      <p className="text-xs text-red-600">{formError}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Tên khách hàng <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={form.customerName}
                    onChange={(e) => { setForm({ ...form, customerName: e.target.value }); setFormError(null) }}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Ghi chú</label>
                  <textarea
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none"
                    rows={3}
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="Ghi chú thêm (nếu có)..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="gap-2">
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                    {editingAsset ? "Cập nhật" : "Thêm mới"}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

function ViewField({
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
