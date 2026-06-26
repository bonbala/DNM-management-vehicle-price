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
  Users,
  Calendar,
  Phone,
  MapPin,
  Car,
  CreditCard,
  User,
  Clock,
  StickyNote,
  Printer,
  Upload,
  ImageIcon,
  Video,
  ExternalLink,
  Paperclip,
} from "lucide-react"
import type { ViolationContract, CreateViolationContractDto, ViolationStatus, Evidence } from "@/types/violation-contract"

const STATUS_MAP: Record<ViolationStatus, { label: string; color: string }> = {
  pending: { label: "Chờ xử lý", color: "text-yellow-600 bg-yellow-50" },
  processed: { label: "Đã xử lý", color: "text-green-600 bg-green-50" },
}

const EMPTY_FORM: CreateViolationContractDto = {
  customerName: "",
  phoneNumber: "",
  customerId: "",
  address: "",
  vehicleName: "",
  violationMoney: 0,  
  violationDate: new Date().toISOString().split("T")[0],
  status: "pending",
  notes: "",
  evidences: [],
}

export default function HdvpPage() {
  const router = useRouter()
  const { user, logout, isAuthenticated, canAccess } = useAuth()

  const [contracts, setContracts] = useState<ViolationContract[]>([])
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
  const [editingContract, setEditingContract] = useState<ViolationContract | null>(null)
  const [form, setForm] = useState<CreateViolationContractDto>(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const [viewingContract, setViewingContract] = useState<ViolationContract | null>(null)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileUpload = async (files: FileList) => {
    setUploadingFiles(true)
    setFormError(null)
    const newEvidences: Evidence[] = [...(form.evidences || [])]
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append("file", file)
        const res = await fetch("/api/upload", { method: "POST", credentials: "include", body: fd })
        if (!res.ok) {
          const err = await res.json()
          setFormError(err.error || `Lỗi upload ${file.name}`)
          break
        }
        const data = await res.json()
        newEvidences.push({
          url: data.url,
          publicId: data.publicId,
          name: data.name,
          resourceType: data.resourceType,
        })
      }
      setForm((prev) => ({ ...prev, evidences: newEvidences }))
    } catch {
      setFormError("Lỗi kết nối khi upload file")
    } finally {
      setUploadingFiles(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1)
    }, 600)
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current) }
  }, [searchTerm])

  const fetchContracts = async (showFullLoading = false) => {
    if (showFullLoading) setIsLoading(true)
    else setIsTableLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(limit),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      })
      const res = await fetch(`/api/hdvp?${params}`, { credentials: "include" })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setContracts(data.data)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch {
      alert("Lỗi khi tải danh sách khách hàng vi phạm")
    } finally {
      setIsLoading(false)
      setIsTableLoading(false)
    }
  }

  useEffect(() => { fetchContracts(true) }, [])
  useEffect(() => { fetchContracts() }, [currentPage, debouncedSearch])

  const openAdd = () => {
    setEditingContract(null)
    setForm({ ...EMPTY_FORM })
    setFormError(null)
    setShowForm(true)
  }

  const openEdit = (c: ViolationContract, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setEditingContract(c)
    setForm({
      customerName: c.customerName,
      phoneNumber: c.phoneNumber,
      customerId: c.customerId,
      address: c.address,
      vehicleName: c.vehicleName,
      violationMoney: c.violationMoney,
      violationDate: new Date(c.violationDate).toISOString().split("T")[0],
      status: c.status,
      notes: c.notes || "",
      evidences: c.evidences || [],
    })
    setFormError(null)
    setViewingContract(null)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.customerName || !form.customerId || !form.phoneNumber) {
      setFormError("Vui lòng điền đầy đủ: Tên khách hàng, CMND/CCCD và Số điện thoại")
      return
    }
    setIsSubmitting(true)
    setFormError(null)
    try {
      const url = editingContract ? `/api/hdvp/${editingContract.id}` : "/api/hdvp"
      const method = editingContract ? "PUT" : "POST"
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
      fetchContracts()
    } catch {
      setFormError("Lỗi kết nối. Vui lòng thử lại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrint = (c: ViolationContract, e?: React.MouseEvent) => {
    e?.stopPropagation()
    localStorage.setItem("selectedViolationContract", JSON.stringify(c))
    window.open("/hdvp/print", "_blank", "width=900,height=700,menubar=no,toolbar=no,location=no,status=no")
  }

  const handlePrintClean = () => {
    localStorage.setItem("cleanViolationSearchId", debouncedSearch)
    window.open("/hdvp/print-clean", "_blank", "width=900,height=700,menubar=no,toolbar=no,location=no,status=no")
  }

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!confirm("Bạn có chắc muốn xóa khách hàng vi phạm này?")) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/hdvp/${id}`, { method: "DELETE", credentials: "include" })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Lỗi ${res.status}`)
      }
      if (viewingContract?.id === id) setViewingContract(null)
      fetchContracts()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Lỗi khi xóa dữ liệu")
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("vi-VN")

  const formatDateTime = (date: string | Date) =>
    new Date(date).toLocaleString("vi-VN")

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(amount)

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
              <Users size={22} className="text-primary" />
              <div>
                <h1 className="text-lg font-bold text-foreground leading-tight">Khách Hàng Vi Phạm</h1>
                <p className="text-xs text-muted-foreground">Quản lý danh sách khách hàng vi phạm</p>
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
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm theo CMND / CCCD..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            {debouncedSearch.trim() && !isTableLoading && contracts.length === 0 && (
              <Button
                variant="outline"
                className="gap-2 whitespace-nowrap border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400"
                onClick={handlePrintClean}
              >
                <Printer size={16} />
                In không vi phạm
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Tổng: <strong>{total}</strong> khách hàng
            </span>
            {canAccess(["admin", "super_admin"]) && (
              <Button onClick={openAdd} className="gap-2 whitespace-nowrap">
                <Plus size={16} />
                Thêm KH
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
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Khách hàng</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">SĐT</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">CMND / CCCD</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Địa chỉ</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Tên xe</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Ngày VP</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Số tiền</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground whitespace-nowrap">Trạng thái</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground whitespace-nowrap">Chứng từ</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Lịch Sử</th>
                  {canAccess(["admin", "super_admin"]) && (
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground whitespace-nowrap">Thao tác</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {isTableLoading ? (
                  <tr>
                    <td colSpan={12} className="text-center py-12">
                      <Loader2 size={24} className="animate-spin text-primary mx-auto" />
                    </td>
                  </tr>
                ) : contracts.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="text-center py-12 text-muted-foreground">
                      <Users size={40} className="mx-auto mb-2 opacity-30" />
                      <p>Chưa có khách hàng vi phạm nào</p>
                    </td>
                  </tr>
                ) : (
                  contracts.map((c, idx) => {
                    const status = STATUS_MAP[c.status]
                    const isSelected = viewingContract?.id === c.id
                    return (
                      <tr
                        key={c.id}
                        className={`border-b last:border-0 transition-colors cursor-pointer select-none ${
                          isSelected
                            ? "bg-primary/5 border-l-2 border-l-primary"
                            : "hover:bg-muted/30"
                        }`}
                        onClick={() => setViewingContract(isSelected ? null : c)}
                      >
                        <td className="px-4 py-3 text-muted-foreground">
                          {(currentPage - 1) * limit + idx + 1}
                        </td>
                        <td className="px-4 py-3 font-medium">{c.customerName}</td>
                        <td className="px-4 py-3">{c.phoneNumber}</td>
                        <td className="px-4 py-3 font-mono text-sm">{c.customerId}</td>
                        <td className="px-4 py-3 max-w-40 truncate" title={c.address}>{c.address}</td>
                        <td className="px-4 py-3">{c.vehicleName}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{formatDate(c.violationDate)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right font-medium">
                          {c.violationMoney ? formatCurrency(c.violationMoney) : <span className="text-muted-foreground/40 text-xs italic">—</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {c.evidences && c.evidences.length > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-blue-600 bg-blue-50">
                              <Paperclip size={11} />
                              {c.evidences.length}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/40 text-xs italic">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 max-w-[200px]">
                          {c.notes ? (
                            <span className="text-muted-foreground text-xs line-clamp-2" title={c.notes}>
                              {c.notes}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/40 text-xs italic">—</span>
                          )}
                        </td>
                        {canAccess(["admin", "super_admin"]) && (
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                                onClick={(e) => openEdit(c, e)}
                              >
                                <Edit3 size={15} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
                                onClick={(e) => handlePrint(c, e)}
                              >
                                <Printer size={15} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                onClick={(e) => handleDelete(c.id, e)}
                                disabled={deletingId === c.id}
                              >
                                {deletingId === c.id ? (
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
      {viewingContract && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setViewingContract(null)}
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
                    <User size={20} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{viewingContract.customerName}</h2>
                    <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_MAP[viewingContract.status].color}`}>
                      {STATUS_MAP[viewingContract.status].label}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setViewingContract(null)}>
                  <X size={18} />
                </Button>
              </div>

              {/* Info grid */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <ViewField icon={<Phone size={14} />} label="Số điện thoại" value={viewingContract.phoneNumber} />
                  <ViewField icon={<CreditCard size={14} />} label="CMND / CCCD" value={viewingContract.customerId} mono />
                </div>

                <ViewField icon={<MapPin size={14} />} label="Địa chỉ" value={viewingContract.address} />

                <div className="grid grid-cols-2 gap-3">
                  <ViewField icon={<Car size={14} />} label="Tên xe" value={viewingContract.vehicleName} />
                  <ViewField icon={<Calendar size={14} />} label="Ngày vi phạm" value={formatDate(viewingContract.violationDate)} />
                </div>

                <ViewField
                  icon={<CreditCard size={14} />}
                  label="Số tiền vi phạm"
                  value={viewingContract.violationMoney ? formatCurrency(viewingContract.violationMoney) : undefined}
                />

                {/* Lịch Sử / Notes */}
                <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <StickyNote size={13} />
                    Lịch Sử / Ghi chú
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed min-h-8">
                    {viewingContract.notes?.trim()
                      ? viewingContract.notes
                      : <span className="text-muted-foreground italic text-xs">Không có ghi chú</span>
                    }
                  </p>
                </div>

                {/* Chứng từ */}
                <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Paperclip size={13} />
                    Chứng từ vi phạm
                  </div>
                  {viewingContract.evidences && viewingContract.evidences.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {viewingContract.evidences.map((ev, idx) => (
                        <a
                          key={idx}
                          href={ev.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-2.5 py-2 rounded-md border bg-background hover:bg-primary/5 hover:border-primary/30 transition-colors group"
                        >
                          {ev.resourceType === "video" ? (
                            <Video size={14} className="text-purple-500 shrink-0" />
                          ) : (
                            <ImageIcon size={14} className="text-blue-500 shrink-0" />
                          )}
                          <span className="text-xs text-foreground truncate flex-1">
                            {ev.name || `Chứng từ ${idx + 1}`}
                          </span>
                          <ExternalLink size={11} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Không có chứng từ</p>
                  )}
                </div>

                {/* Meta */}
                <div className="border-t pt-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User size={12} />
                    Tạo bởi: <span className="font-medium text-foreground ml-1">{viewingContract.createdBy}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock size={12} />
                    Tạo lúc: {formatDateTime(viewingContract.createdAt)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className={`flex gap-2 mt-5 pt-4 border-t ${canAccess(["admin", "super_admin"]) ? "justify-between" : "justify-end"}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                  onClick={(e) => handlePrint(viewingContract, e)}
                >
                  <Printer size={14} />
                  In biên bản
                </Button>
                {canAccess(["admin", "super_admin"]) && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      onClick={(e) => handleDelete(viewingContract.id, e)}
                      disabled={deletingId === viewingContract.id}
                    >
                      {deletingId === viewingContract.id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Trash2 size={14} />
                      }
                      Xóa
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={(e) => openEdit(viewingContract, e)}
                    >
                      <Edit3 size={14} />
                      Chỉnh sửa
                    </Button>
                  </div>
                )}
              </div>
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
                  {editingContract ? "Chỉnh sửa khách hàng vi phạm" : "Thêm khách hàng vi phạm"}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <label className="text-sm font-medium">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={form.phoneNumber}
                      onChange={(e) => { setForm({ ...form, phoneNumber: e.target.value }); setFormError(null) }}
                      placeholder="0901234567"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">
                      CMND / CCCD <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={form.customerId}
                      onChange={(e) => { setForm({ ...form, customerId: e.target.value }); setFormError(null) }}
                      placeholder="012345678901"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">
                      Tên xe <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={form.vehicleName}
                      onChange={(e) => setForm({ ...form, vehicleName: e.target.value })}
                      placeholder="Honda Wave Alpha 2022"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Địa chỉ</label>
                  <Input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="123 Nguyễn Huệ, Q.1, TP.HCM"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Số tiền vi phạm</label>
                  <Input
                    type="number"
                    value={form.violationMoney}
                    onChange={(e) => setForm({ ...form, violationMoney: Number(e.target.value) })}
                    placeholder="500000"
                    min={0}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Ngày vi phạm</label>
                    <Input
                      type="date"
                      value={form.violationDate}
                      onChange={(e) => setForm({ ...form, violationDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Trạng thái</label>
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as ViolationStatus })}
                    >
                      {Object.entries(STATUS_MAP).map(([val, { label }]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Lịch Sử / Ghi chú</label>
                  <textarea
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none"
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Ghi chú thêm (nếu có)..."
                  />
                </div>

                {/* Upload chứng từ */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Paperclip size={14} />
                    Chứng từ vi phạm
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) handleFileUpload(e.target.files)
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 w-full border-dashed"
                    disabled={uploadingFiles}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadingFiles ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Đang upload...
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        Chọn ảnh (max 10MB) / video (max 100MB)
                      </>
                    )}
                  </Button>

                  {form.evidences && form.evidences.length > 0 && (
                    <div className="space-y-1.5">
                      {form.evidences.map((ev, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border bg-muted/20">
                          {ev.resourceType === "video" ? (
                            <Video size={14} className="text-purple-500 shrink-0" />
                          ) : (
                            <ImageIcon size={14} className="text-blue-500 shrink-0" />
                          )}
                          <span className="text-xs text-foreground truncate flex-1">{ev.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 hover:bg-red-50 hover:text-red-600"
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                evidences: prev.evidences?.filter((_, i) => i !== idx),
                              }))
                            }}
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isSubmitting || uploadingFiles} className="gap-2">
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                    {editingContract ? "Cập nhật" : "Thêm mới"}
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
